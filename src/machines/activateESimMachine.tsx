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
import {storageDeleteCoupledWithCode, storageGetCoupledWithCode, storageGetMsisdn, storagePersistMsisdn} from '../services/storageService';
import {ErrorDetails} from '../types';
import {translate} from '../localization/Localization';
import {activateESimStateNavigationListener} from '../navigation/machines/activateESimStateNavigation';

const hasValidDetails: ESIMActivationMachineGuard = ({msisdn, couplingCode}) =>
  !!msisdn && !!couplingCode;

const needsKeyCleanup: ESIMActivationMachineGuard = (context) => !!context.musapLinkIdCreatedNow;


const esimActivationMachineStates: ESIMActivationMachineStatesConfig = {
  [ESIMActivationMachineStateTypes.esim_init]: {
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
          error: (_ctx: ESIMActivationMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_esim_error_create_link_failed'),
            message: _event.data.message
          })

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
        target: ESIMActivationMachineStateTypes.getMsisdn,
        actions: assign({
          sscdInfo: (_, event) => event.data,
        }),
      }],
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: ESIMActivationMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_esim_error_couple_rp_failed'),
            message: _event.data.message
          })

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
          target: ESIMActivationMachineStateTypes.getMsisdn,
          actions: assign({
            sscdInfo: (_, event) => event.data,
          }),
        },
      ],
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: ESIMActivationMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_esim_error_enable_sscd_failed'),
            message: _event.data.message
          })

        }),
      },
    },
  },
  [ESIMActivationMachineStateTypes.cleanupKeys]: {
    invoke: {
      src: ESIMActivationMachineServices.cleanupKeys,
      onDone: {
        target: ESIMActivationMachineStateTypes.getMsisdn,
      },
      onError: {
        target: ESIMActivationMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: ESIMActivationMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_esim_error_cleanup_keys_failed'),
            message: _event.data.message
          })
        }),
      },
    },
  },

  [ESIMActivationMachineStateTypes.getMsisdn]: {
    invoke: {
      src: ESIMActivationMachineServices.getMsisdn,
      onDone: {
        target: ESIMActivationMachineStateTypes.getCoupledWithCode,
        actions: assign({
          msisdn: (_, event) => {
            let msisdn: string | null | undefined = event.data;
            if(msisdn == null) {
              msisdn = undefined
            }
            console.log('assigning getMsisdn to context', msisdn)
            return event.data ? event.data : undefined;
          },
        }),
      },
    },
  },

  [ESIMActivationMachineStateTypes.getCoupledWithCode]: {
    invoke: {
      src: ESIMActivationMachineServices.getCoupledWithCode,
      onDone: {
        target: ESIMActivationMachineStateTypes.enterDetails,
        actions: assign({
          coupledWithCode: (_, event) => {
            console.log('assigning coupledWithCode to context', event.data)
            return event.data;
          },
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
      PREVIOUS: ESIMActivationMachineStateTypes.abort
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
          error: (_ctx: ESIMActivationMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_esim_error_couple_rp_failed'),
            message: _event.data.message
          })
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
          error: (_ctx: ESIMActivationMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_esim_error_bindkey_failed'),
            message: _event.data.message
          })
        })
      }
    }
  },
  [ESIMActivationMachineStateTypes.handleError]: {
    on: {
      NEXT: ESIMActivationMachineStateTypes.error,
      PREVIOUS: ESIMActivationMachineStateTypes.esim_init,
    },
  },
  [ESIMActivationMachineStateTypes.error]: {
    type: 'final',
  },
  [ESIMActivationMachineStateTypes.success]: {
    type: 'final',
  },
  [ESIMActivationMachineStateTypes.abort]: {
    type: 'final'
  },
};

const createESIMActivationMachine = (opts?: CreateESIMActivationMachineOpts): ESIMActivationStateMachine => {
  const initialContext: ESIMActivationMachineContext = {};

  return createMachine<ESIMActivationMachineContext, ESIMActivationMachineEventTypes>(
    {
      id: opts?.machineId ?? 'ESIMActivation',
      predictableActionArguments: true,
      initial: ESIMActivationMachineStateTypes.esim_init,
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
          [ESIMActivationMachineServices.getMsisdn]: storageGetMsisdn,
          [ESIMActivationMachineServices.getCoupledWithCode]: storageGetCoupledWithCode,
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
        void activateESimStateNavigationListener(newInst, snapshot);
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
