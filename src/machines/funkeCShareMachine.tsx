import {assign, createMachine, DoneInvokeEvent, interpret} from 'xstate';
import Debug, {Debugger} from 'debug';
import {funkeCShareStateNavigationListener} from '../navigation/machines/funkeCShareStateNavigation';
import {APP_ID} from '../@config/constants';
import {
  FunkeCShareStateMachine,
  FunkeCShareMachineContext,
  FunkeCShareMachineEventTypes,
  FunkeCShareMachineOpts,
  FunkeCShareMachineStatesStatesConfig,
  FunkeCShareMachineStateTypes,
  FunkeCShareMachineServices,
  FunkeCShareMachineGuards,
  FunkeCShareMachineInterpreter,
  InstanceFunkeCShareMachineOpts,
  FunkeCShareMachineState,
  FunkeCShareMachineGuard,
} from '../types/machines/funkeCShareMachine';
import {SiopV2AuthorizationRequestData} from '../types/machines/siopV2';
import {DidAuthConfig, Party} from '@sphereon/ssi-sdk.data-store';
import {ErrorDetails} from '../types';
import {translate} from '../localization/Localization';
import {MappedCredential} from '../types/machines/getPIDCredentialMachine';

const debug: Debugger = Debug(`${APP_ID}:funkeCShare`);

const hasFunkeRefreshUrl: FunkeCShareMachineGuard = ({funkeProvider}) => funkeProvider?.refreshUrl !== undefined;

const funkeCShareMachineStates: FunkeCShareMachineStatesStatesConfig = {
  createConfig: {
    id: FunkeCShareMachineStateTypes.createConfig,
    invoke: {
      src: FunkeCShareMachineServices.createConfig,
      onDone: {
        target: FunkeCShareMachineStateTypes.getSiopRequest,
        actions: assign({
          didAuthConfig: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<DidAuthConfig>) => _event.data,
        }),
      },
      onError: {
        target: FunkeCShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('siopV2_machine_create_config_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  getSiopRequest: {
    id: FunkeCShareMachineStateTypes.getSiopRequest,
    invoke: {
      src: FunkeCShareMachineServices.getSiopRequest,
      onDone: {
        target: FunkeCShareMachineStateTypes.retrieveContact,
        actions: assign({
          authorizationRequestData: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<SiopV2AuthorizationRequestData>) => _event.data,
        }),
      },
      onError: {
        target: FunkeCShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('siopV2_machine_get_request_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  retrieveContact: {
    id: FunkeCShareMachineStateTypes.retrieveContact,
    invoke: {
      src: FunkeCShareMachineServices.retrieveContact,
      onDone: {
        target: FunkeCShareMachineStateTypes.acceptRequestInformation,
        actions: assign({contact: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<Party>) => _event.data}),
      },
      onError: {
        target: FunkeCShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('siopV2_machine_retrieve_contact_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  acceptRequestInformation: {
    on: {
      PREVIOUS: {
        target: FunkeCShareMachineStateTypes.aborted,
      },
      NEXT: {
        target: FunkeCShareMachineStateTypes.authenticateAusweisEID,
      },
    },
  },
  authenticateAusweisEID: {
    on: {
      PREVIOUS: FunkeCShareMachineStateTypes.acceptRequestInformation,
      SET_FUNKE_PROVIDER: {actions: assign({funkeProvider: (_, event) => event.data})},
      NEXT: {
        cond: FunkeCShareMachineGuards.hasFunkeRefreshUrl,
        target: FunkeCShareMachineStateTypes.authenticate,
      },
    },
  },
  authenticate: {
    on: {
      PREVIOUS: FunkeCShareMachineStateTypes.acceptRequestInformation,
      NEXT: FunkeCShareMachineStateTypes.retrievePIDCredentials,
    },
  },
  retrievePIDCredentials: {
    invoke: {
      src: FunkeCShareMachineServices.retrievePIDCredentials,
      onDone: {
        target: FunkeCShareMachineStateTypes.acceptShareCredential,
        actions: assign({pidCredentials: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<Array<MappedCredential>>) => _event.data}),
      },
      onError: {
        target: FunkeCShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_machine_retrieve_credentials_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  acceptShareCredential: {
    on: {
      PREVIOUS: FunkeCShareMachineStateTypes.acceptRequestInformation,
      NEXT: FunkeCShareMachineStateTypes.retrievePIDCredentials,
    },
  },
  sendResponse: {
    id: FunkeCShareMachineStateTypes.sendResponse,
    invoke: {
      src: FunkeCShareMachineServices.sendResponse,
      onDone: {
        target: FunkeCShareMachineStateTypes.done,
      },
      onError: {
        target: FunkeCShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeCShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('siopV2_machine_send_response_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  handleError: {
    on: {
      PREVIOUS: {
        target: FunkeCShareMachineStateTypes.error,
      },
      NEXT: {
        target: FunkeCShareMachineStateTypes.error,
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

const createFunkeCShareMachine = (opts?: FunkeCShareMachineOpts): FunkeCShareStateMachine => {
  const initialContext: FunkeCShareMachineContext = {
    pidCredentials: [],
  };

  return createMachine<FunkeCShareMachineContext, FunkeCShareMachineEventTypes>({
    id: opts?.machineId ?? 'FunkeCShare',
    predictableActionArguments: true,
    initial: FunkeCShareMachineStateTypes.createConfig,
    schema: {
      events: {} as FunkeCShareMachineEventTypes,
      guards: {} as {
        type: FunkeCShareMachineGuards.hasFunkeRefreshUrl;
      },
      services: {} as {
        // [FunkeCShareMachineServices.retrievePIDCredentials]: {
        //   data: Array<MappedCredential>;
        // };
        // [FunkeCShareMachineServices.storePIDCredentials]: {
        //   data: void;
        // };
        // [FunkeCShareMachineServices.storeCredentialBranding]: {
        //   data: void;
        // };
      },
    },
    context: initialContext,
    states: funkeCShareMachineStates,
  });
};

export class FunkeCShareMachine {
  private static _instance: FunkeCShareMachineInterpreter | undefined;

  static hasInstance(): boolean {
    return FunkeCShareMachine._instance !== undefined;
  }

  static get instance(): FunkeCShareMachineInterpreter {
    if (!FunkeCShareMachine._instance) {
      throw Error('Please initialize a funkeCShare machine first');
    }
    return FunkeCShareMachine._instance;
  }

  static clearInstance(opts: {stop: boolean}) {
    const {stop} = opts;
    if (FunkeCShareMachine.hasInstance()) {
      if (stop) {
        this.stopInstance();
      }
    }
    FunkeCShareMachine._instance = undefined;
  }

  static stopInstance(): void {
    debug(`Stopping funkeCShare instance...`);
    if (!FunkeCShareMachine.hasInstance()) {
      debug(`No funkeCShare instance present to stop`);
      return;
    }
    FunkeCShareMachine.instance.stop();
    FunkeCShareMachine._instance = undefined;
    debug(`Stopped funkeCShare instance`);
  }

  public static newInstance(opts?: InstanceFunkeCShareMachineOpts): FunkeCShareMachineInterpreter {
    debug(`Creating new funkeCShare instance`, opts);
    const newInst: FunkeCShareMachineInterpreter = interpret(
      createFunkeCShareMachine(opts).withConfig({
        services: {
          // [GetPIDCredentialsMachineServices.retrievePIDCredentials]: retrievePIDCredentials,
          // [GetPIDCredentialsMachineServices.storePIDCredentials]: storePIDCredentials,
          // [GetPIDCredentialsMachineServices.storeCredentialBranding]: storeCredentialBranding,
          // [GetPIDCredentialsMachineServices.fetchCredentialsInStore]: fetchVerifiableCredentials,
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
      newInst.onTransition((snapshot: FunkeCShareMachineState): void => {
        void funkeCShareStateNavigationListener(newInst, snapshot);
      });
    }
    debug(`New funkeCShare instance created`, opts);
    return newInst;
  }

  static getInstance(
    opts?: InstanceFunkeCShareMachineOpts & {
      requireExisting?: boolean;
    },
  ): FunkeCShareMachineInterpreter {
    if (!FunkeCShareMachine._instance) {
      if (opts?.requireExisting === true) {
        throw Error(`Existing funkeCShare instance requested, but none was created at this point!`);
      }
      FunkeCShareMachine._instance = FunkeCShareMachine.newInstance(opts);
    }
    return FunkeCShareMachine._instance;
  }
}
