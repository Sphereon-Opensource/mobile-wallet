import {assign, createMachine, DoneInvokeEvent, interpret} from 'xstate';
import Debug, {Debugger} from 'debug';
import {
  fetchVerifiableCredentials,
  retrievePIDCredentials,
  storeCredentialBranding,
  storePIDCredentials,
} from '../services/machines/getPIDCredentialMachineService';
import {getPIDCredentialsStateNavigationListener} from '../navigation/machines/getPIDCredentialsStateNavigation';
import {translate} from '../localization/Localization';
import {APP_ID} from '../@config/constants';
import {
  CreateGetPIDCredentialsMachineOpts,
  GetPIDCredentialsMachineContext,
  GetPIDCredentialsMachineEventTypes,
  GetPIDCredentialsMachineGuard,
  GetPIDCredentialsMachineGuards,
  GetPIDCredentialsMachineInterpreter,
  GetPIDCredentialsMachineServices,
  GetPIDCredentialsMachineState,
  GetPIDCredentialsMachineStatesConfig,
  GetPIDCredentialsMachineStateTypes,
  GetPIDCredentialsStateMachine,
  InstanceGetPIDCredentialsMachineOpts,
  MappedCredential,
} from '../types/machines/getPIDCredentialMachine';
import {ErrorDetails} from '../types';
import {getVerifiableCredentials} from '../store/actions/credential.actions';

const debug: Debugger = Debug(`${APP_ID}:getPIDCredentials`);

const hasFunkeRefreshUrl: GetPIDCredentialsMachineGuard = ({funkeProvider}) => funkeProvider?.refreshUrl !== undefined;

const getPIDCredentialMachineStates: GetPIDCredentialsMachineStatesConfig = {
  consentToAddPIDCredentials: {
    on: {
      PREVIOUS: GetPIDCredentialsMachineStateTypes.aborted,
      NEXT: GetPIDCredentialsMachineStateTypes.authenticateAusweisEID,
    },
  },
  authenticateAusweisEID: {
    on: {
      PREVIOUS: GetPIDCredentialsMachineStateTypes.consentToAddPIDCredentials,
      SET_FUNKE_PROVIDER: {actions: assign({funkeProvider: (_, event) => event.data})},
      NEXT: {cond: GetPIDCredentialsMachineGuards.hasFunkeRefreshUrl, target: GetPIDCredentialsMachineStateTypes.authenticate},
    },
  },
  authenticate: {
    on: {
      PREVIOUS: GetPIDCredentialsMachineStateTypes.consentToAddPIDCredentials,
      NEXT: GetPIDCredentialsMachineStateTypes.retrievePIDCredentials,
    },
  },
  retrievePIDCredentials: {
    invoke: {
      src: GetPIDCredentialsMachineServices.retrievePIDCredentials,
      onDone: {
        target: GetPIDCredentialsMachineStateTypes.reviewPIDCredentials,
        actions: assign({pidCredentials: (_ctx: GetPIDCredentialsMachineContext, _event: DoneInvokeEvent<Array<MappedCredential>>) => _event.data}),
      },
      onError: {
        target: GetPIDCredentialsMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: GetPIDCredentialsMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_machine_retrieve_credentials_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  reviewPIDCredentials: {
    on: {
      PREVIOUS: GetPIDCredentialsMachineStateTypes.authenticateAusweisEID,
      DECLINE_INFORMATION: {
        target: GetPIDCredentialsMachineStateTypes.declinePIDCredentials,
      },
      NEXT: {
        target: GetPIDCredentialsMachineStateTypes.storePIDCredentials,
      },
    },
  },
  declinePIDCredentials: {
    on: {
      PREVIOUS: GetPIDCredentialsMachineStateTypes.reviewPIDCredentials,
      NEXT: {
        target: GetPIDCredentialsMachineStateTypes.declined,
      },
    },
  },
  storePIDCredentials: {
    invoke: {
      src: GetPIDCredentialsMachineServices.storePIDCredentials,
      onDone: {
        target: GetPIDCredentialsMachineStateTypes.storeCredentialBranding,
      },
      onError: {
        target: GetPIDCredentialsMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: GetPIDCredentialsMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_machine_store_credential_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  storeCredentialBranding: {
    invoke: {
      src: GetPIDCredentialsMachineServices.storeCredentialBranding,
      onDone: {
        target: GetPIDCredentialsMachineStateTypes.fetchCredentialsInStore,
      },
      onError: {
        target: GetPIDCredentialsMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: GetPIDCredentialsMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_store_credential_branding_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  fetchCredentialsInStore: {
    invoke: {
      src: GetPIDCredentialsMachineServices.fetchCredentialsInStore,
      onDone: {
        target: GetPIDCredentialsMachineStateTypes.done,
      },
      onError: {
        target: GetPIDCredentialsMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: GetPIDCredentialsMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: 'Fetch credential in store',
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  handleError: {
    on: {
      PREVIOUS: {
        target: GetPIDCredentialsMachineStateTypes.error,
      },
      NEXT: {
        target: GetPIDCredentialsMachineStateTypes.error,
      },
    },
  },
  error: {
    type: 'final',
  },
  declined: {
    type: 'final',
  },
  aborted: {
    type: 'final',
  },
  done: {
    type: 'final',
  },
};

const createGetPIDCredentialMachine = (opts?: CreateGetPIDCredentialsMachineOpts): GetPIDCredentialsStateMachine => {
  const initialContext: GetPIDCredentialsMachineContext = {
    pidCredentials: [],
  };

  return createMachine<GetPIDCredentialsMachineContext, GetPIDCredentialsMachineEventTypes>({
    id: opts?.machineId ?? 'GetPIDCredentials',
    predictableActionArguments: true,
    initial: GetPIDCredentialsMachineStateTypes.consentToAddPIDCredentials,
    schema: {
      events: {} as GetPIDCredentialsMachineEventTypes,
      guards: {} as {type: GetPIDCredentialsMachineGuards.hasFunkeRefreshUrl},
      services: {} as {
        [GetPIDCredentialsMachineServices.retrievePIDCredentials]: {
          data: Array<MappedCredential>;
        };
        [GetPIDCredentialsMachineServices.storePIDCredentials]: {
          data: void;
        };
        [GetPIDCredentialsMachineServices.storeCredentialBranding]: {
          data: void;
        };
      },
    },
    context: initialContext,
    states: getPIDCredentialMachineStates,
  });
};

export class GetPIDCredentialsMachine {
  private static _instance: GetPIDCredentialsMachineInterpreter | undefined;

  static hasInstance(): boolean {
    return GetPIDCredentialsMachine._instance !== undefined;
  }

  static get instance(): GetPIDCredentialsMachineInterpreter {
    if (!GetPIDCredentialsMachine._instance) {
      throw Error('Please initialize a getPIDCredentials machine first');
    }
    return GetPIDCredentialsMachine._instance;
  }

  static clearInstance(opts: {stop: boolean}) {
    const {stop} = opts;
    if (GetPIDCredentialsMachine.hasInstance()) {
      if (stop) {
        this.stopInstance();
      }
    }
    GetPIDCredentialsMachine._instance = undefined;
  }

  static stopInstance(): void {
    debug(`Stopping getPIDCredentials instance...`);
    if (!GetPIDCredentialsMachine.hasInstance()) {
      debug(`No getPIDCredentials instance present to stop`);
      return;
    }
    GetPIDCredentialsMachine.instance.stop();
    GetPIDCredentialsMachine._instance = undefined;
    debug(`Stopped getPIDCredentials instance`);
  }

  public static newInstance(opts?: InstanceGetPIDCredentialsMachineOpts): GetPIDCredentialsMachineInterpreter {
    debug(`Creating new getPIDCredentials instance`, opts);
    const newInst: GetPIDCredentialsMachineInterpreter = interpret(
      createGetPIDCredentialMachine(opts).withConfig({
        services: {
          [GetPIDCredentialsMachineServices.retrievePIDCredentials]: retrievePIDCredentials,
          [GetPIDCredentialsMachineServices.storePIDCredentials]: storePIDCredentials,
          [GetPIDCredentialsMachineServices.storeCredentialBranding]: storeCredentialBranding,
          [GetPIDCredentialsMachineServices.fetchCredentialsInStore]: fetchVerifiableCredentials,
          ...opts?.services,
        },
        guards: {
          hasFunkeRefreshUrl,
          ...opts?.guards,
        },
      }),
    );
    if (typeof opts?.subscription === 'function') {
      newInst.onTransition(opts.subscription);
    }
    if (opts?.requireCustomNavigationHook !== true) {
      debug(`Onboarding machine hookup state navigation listener`, opts);
      newInst.onTransition((snapshot: GetPIDCredentialsMachineState): void => {
        void getPIDCredentialsStateNavigationListener(newInst, snapshot);
      });
    }
    debug(`New getPIDCredentials instance created`, opts);
    return newInst;
  }

  static getInstance(
    opts?: InstanceGetPIDCredentialsMachineOpts & {
      requireExisting?: boolean;
    },
  ): GetPIDCredentialsMachineInterpreter {
    if (!GetPIDCredentialsMachine._instance) {
      if (opts?.requireExisting === true) {
        throw Error(`Existing getPIDCredentials instance requested, but none was created at this point!`);
      }
      GetPIDCredentialsMachine._instance = GetPIDCredentialsMachine.newInstance(opts);
    }
    return GetPIDCredentialsMachine._instance;
  }
}
