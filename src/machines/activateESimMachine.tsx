import {assign, createMachine, DoneInvokeEvent, interpret} from 'xstate';
import {
  bindKey,
  checkMustEnableLink,
  checkSscd,
  cleanupKeys,
  coupleWithRP,
  createMusapLink,
  enableSscd,
} from '../services/machines/activateESimMachineService';
import {
  CreateESIMActivationMachineOpts,
  ESIMActivationMachineContext,
  ESIMActivationMachineEventTypes,
  ESIMActivationMachineGuard,
  ESIMActivationMachineGuards,
  ESIMActivationMachineInterpreter,
  ESIMActivationMachineServices,
  ESIMActivationMachineState,
  ESIMActivationMachineStatesConfig,
  ESIMActivationMachineStateTypes,
  ESIMActivationStateMachine,
  InstanceESIMActivationMachineOpts,
} from '../types/machines/activateESimMachine';
import {storageDeleteCoupledWithCode, storageGetCoupledWithCode, storagePersistMsisdn} from '../services/storageService';


const hasValidDetails: ESIMActivationMachineGuard = ({msisdn, couplingCode}) =>
  !!msisdn && !!couplingCode;

const needsKeyCleanup: ESIMActivationMachineGuard = (context) => !!context.musapLinkIdCreatedNow;


const esimActivationMachineStates: ESIMActivationMachineStatesConfig = {
  [ESIMActivationMachineStateTypes.init]: {
    invoke: {
      src: ESIMActivationMachineServices.checkMustEnableLink,
      onDone: [
        {
          target: ESIMActivationMachineStateTypes.createMusapLink,
          cond: (_, event) => event.data === true,
        },
        {
          target: ESIMActivationMachineStateTypes.checkSscd,
        },
      ],
    },
  },
  [ESIMActivationMachineStateTypes.createMusapLink]: {
    invoke: {
      src: ESIMActivationMachineServices.createMusapLink,
      onDone: {
        target: ESIMActivationMachineStateTypes.checkSscd,
        actions: [
          assign({
            musapLinkId: (_, event: DoneInvokeEvent<string>) => event.data,
            musapLinkIdCreatedNow: () => true,
            coupledWithCode: () => undefined,
          }),
          (context) => storageDeleteCoupledWithCode(),
        ],
      },
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_, event) => event.data as Error,
        }),
      },
    },
  },
  [ESIMActivationMachineStateTypes.checkSscd]: {
    invoke: {
      src: ESIMActivationMachineServices.checkSscd,
      onDone: [{
        target: ESIMActivationMachineStateTypes.enableSscd,
        cond: (_, event) => !event.data,
      }, {
        target: ESIMActivationMachineStateTypes.enterDetails,
        actions: assign({
          sscdInfo: (_, event) => event.data,
        }),
      }],
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_, event) => event.data as Error,
        }),
      },
    },
  },
  [ESIMActivationMachineStateTypes.enableSscd]: {
    invoke: {
      src: ESIMActivationMachineServices.enableSscd,
      onDone: [
        {
          target: ESIMActivationMachineStateTypes.cleanupKeys,
          cond: ESIMActivationMachineGuards.needsKeyCleanup,
          actions: assign({
            sscdInfo: (_, event) => event.data,
          }),
        },
        {
          target: ESIMActivationMachineStateTypes.enterDetails,
          actions: assign({
            sscdInfo: (_, event) => event.data,
          }),
        },
      ],
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_, event) => event.data as Error,
        }),
      },
    },
  },
  [ESIMActivationMachineStateTypes.cleanupKeys]: {
    invoke: {
      src: ESIMActivationMachineServices.cleanupKeys,
      onDone: {
        target: ESIMActivationMachineStateTypes.loadCoupledWithCode,
      },
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_, event) => event.data as Error,
        }),
      },
    },
  },

  [ESIMActivationMachineStateTypes.loadCoupledWithCode]: {
    invoke: {
      src: ESIMActivationMachineServices.getCoupledWithCode,
      onDone: {
        target: ESIMActivationMachineStateTypes.enterDetails,
        actions: assign({
          coupledWithCode: (_, event) => event.data,
        }),
      },
    },
  },

  [ESIMActivationMachineStateTypes.enterDetails]: {
    on: {
      SET_MSISDN: {
        actions: assign({
          msisdn: (_, event) => event.msisdn,
        }),
      },
      SET_COUPLING_CODE: {
        actions: assign({
          couplingCode: (_, event) => event.couplingCode,
        }),
      },
      NEXT: {
        target: ESIMActivationMachineStateTypes.coupleWithRP,
        cond: ESIMActivationMachineGuards.hasValidDetails,
      },
      PREVIOUS: ESIMActivationMachineStateTypes.init,
    },
  },
  [ESIMActivationMachineStateTypes.coupleWithRP]: {
    invoke: {
      src: ESIMActivationMachineServices.coupleWithRP,
      onDone: {
        target: ESIMActivationMachineStateTypes.bindKey,
      },
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_, event) => event.data as Error,
        }),
      },
    },
  },
  [ESIMActivationMachineStateTypes.bindKey]: {
    invoke: {
      src: ESIMActivationMachineServices.bindKey,
      onDone: {
        target: ESIMActivationMachineStateTypes.success,
        actions: (context) => {
          if (context.msisdn) {
            void storagePersistMsisdn(context.msisdn)
          }
        }
      },
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_, event) => event.data as Error
        })
      }
    }
  },
  [ESIMActivationMachineStateTypes.handleError]: {
    on: {
      NEXT: ESIMActivationMachineStateTypes.error,
      PREVIOUS: ESIMActivationMachineStateTypes.init,
    },
  },
  [ESIMActivationMachineStateTypes.error]: {
    type: 'final',
  },
  [ESIMActivationMachineStateTypes.success]: {
    type: 'final',
  },
};

const createESIMActivationMachine = (opts?: CreateESIMActivationMachineOpts): ESIMActivationStateMachine => {
  const initialContext: ESIMActivationMachineContext = {};

  return createMachine<ESIMActivationMachineContext, ESIMActivationMachineEventTypes>(
    {
      id: opts?.machineId ?? 'ESIMActivation',
      predictableActionArguments: true,
      initial: ESIMActivationMachineStateTypes.init,
      context: initialContext,
      states: esimActivationMachineStates,
    },
    {
      guards: {
        hasValidDetails,
        needsKeyCleanup,
      },
    },
  );
};

export class ESIMActivationMachine {
  private static _instance: ESIMActivationMachineInterpreter | undefined;

  static hasInstance(): boolean {
    return ESIMActivationMachine._instance !== undefined;
  }

  static get instance(): ESIMActivationMachineInterpreter {
    if (!ESIMActivationMachine._instance) {
      throw Error('Please initialize ESIMActivation machine first');
    }
    return ESIMActivationMachine._instance;
  }

  static clearInstance(opts: {stop: boolean}) {
    const {stop} = opts;
    if (ESIMActivationMachine.hasInstance()) {
      if (stop) {
        ESIMActivationMachine.stopInstance();
      }
    }
    ESIMActivationMachine._instance = undefined;
  }

  static stopInstance(): void {
    if (!ESIMActivationMachine.hasInstance()) {
      return;
    }
    ESIMActivationMachine.instance.stop();
    ESIMActivationMachine._instance = undefined;
  }

  public static newInstance(opts?: InstanceESIMActivationMachineOpts): ESIMActivationMachineInterpreter {
    const newInst: ESIMActivationMachineInterpreter = interpret(
      createESIMActivationMachine(opts).withConfig({
        services: {
          [ESIMActivationMachineServices.checkMustEnableLink]: checkMustEnableLink,
          [ESIMActivationMachineServices.createMusapLink]: createMusapLink,
          [ESIMActivationMachineServices.checkSscd]: checkSscd,
          [ESIMActivationMachineServices.enableSscd]: enableSscd,
          [ESIMActivationMachineServices.cleanupKeys]: cleanupKeys,
          [ESIMActivationMachineServices.loadCoupledWithCode]: storageGetCoupledWithCode,
          [ESIMActivationMachineServices.storageDeleteCoupledWithCode]: storageDeleteCoupledWithCode,
          [ESIMActivationMachineServices.coupleWithRP]: coupleWithRP,
          [ESIMActivationMachineServices.bindKey]: bindKey,
          ...opts?.services,
        },
        guards: {
          hasValidDetails,
          ...opts?.guards,
        },
      }),
    );

    if (typeof opts?.subscription === 'function') {
      newInst.onTransition(opts.subscription);
    }

    if (opts?.requireCustomNavigationHook !== true) {
      newInst.onTransition((snapshot: ESIMActivationMachineState): void => {
        // TODO: Implement navigation listener similar to getPIDCredentialsStateNavigationListener
      });
    }

    return newInst;
  }

  static getInstance(
    opts?: InstanceESIMActivationMachineOpts & {
      requireExisting?: boolean;
    },
  ): ESIMActivationMachineInterpreter {
    if (!ESIMActivationMachine._instance) {
      if (opts?.requireExisting === true) {
        throw Error(`Existing ESIMActivation instance requested, but none was created at this point!`);
      }
      ESIMActivationMachine._instance = ESIMActivationMachine.newInstance(opts);
    }
    return ESIMActivationMachine._instance;
  }
}
