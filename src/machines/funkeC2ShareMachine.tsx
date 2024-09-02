import {assign, createMachine, DoneInvokeEvent, interpret} from 'xstate';
import Debug, {Debugger} from 'debug';
import {funkeC2ShareStateNavigationListener} from '../navigation/machines/funkeC2ShareStateNavigation';
import {APP_ID} from '../@config/constants';
import {
  FunkeC2ShareStateMachine,
  FunkeC2ShareMachineContext,
  FunkeC2ShareMachineEventTypes,
  FunkeC2ShareMachineOpts,
  FunkeC2ShareMachineStatesStatesConfig,
  FunkeC2ShareMachineStateTypes,
  FunkeC2ShareMachineServices,
  FunkeC2ShareMachineGuards,
  FunkeC2ShareMachineInterpreter,
  InstanceFunkeC2ShareMachineOpts,
  FunkeC2ShareMachineState,
  FunkeC2ShareMachineGuard,
} from '../types/machines/funkeC2ShareMachine';
import {SiopV2AuthorizationRequestData} from '../types/machines/siopV2';
import {DidAuthConfig, Party} from '@sphereon/ssi-sdk.data-store';
import {ErrorDetails} from '../types';
import {translate} from '../localization/Localization';
import {MappedCredential} from '../types/machines/getPIDCredentialMachine';
import {CreateConfigResult, Siopv2AuthorizationRequestData, Siopv2AuthorizationResponseData} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {
  retrievePIDCredentials,
  siopCreateConfig,
  siopGetSiopRequest,
  siopRetrieveContact,
  siopSendResponse,
} from '../services/machines/funkeC2ShareMachineService';

const debug: Debugger = Debug(`${APP_ID}:funkeCShare`);

const hasFunkeRefreshUrl: FunkeC2ShareMachineGuard = ({funkeProvider}) => funkeProvider?.refreshUrl !== undefined;

const funkeCShareMachineStates: FunkeC2ShareMachineStatesStatesConfig = {
  createConfig: {
    id: FunkeC2ShareMachineStateTypes.createConfig,
    invoke: {
      src: FunkeC2ShareMachineServices.createConfig,
      onDone: {
        target: FunkeC2ShareMachineStateTypes.getSiopRequest,
        actions: assign({
          didAuthConfig: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<DidAuthConfig>) => _event.data,
        }),
      },
      onError: {
        target: FunkeC2ShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('siopV2_machine_create_config_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  getSiopRequest: {
    id: FunkeC2ShareMachineStateTypes.getSiopRequest,
    invoke: {
      src: FunkeC2ShareMachineServices.getSiopRequest,
      onDone: {
        target: FunkeC2ShareMachineStateTypes.retrieveContact,
        actions: assign({
          authorizationRequestData: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<SiopV2AuthorizationRequestData>) => _event.data,
        }),
      },
      onError: {
        target: FunkeC2ShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('siopV2_machine_get_request_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  retrieveContact: {
    id: FunkeC2ShareMachineStateTypes.retrieveContact,
    invoke: {
      src: FunkeC2ShareMachineServices.retrieveContact,
      onDone: {
        target: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
        actions: assign({contact: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Party>) => _event.data}),
      },
      onError: {
        target: FunkeC2ShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
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
        target: FunkeC2ShareMachineStateTypes.aborted,
      },
      NEXT: {
        target: FunkeC2ShareMachineStateTypes.authenticateAusweisEID,
      },
    },
  },
  authenticateAusweisEID: {
    on: {
      PREVIOUS: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
      SET_FUNKE_PROVIDER: {actions: assign({funkeProvider: (_, event) => event.data})},
      NEXT: {
        cond: FunkeC2ShareMachineGuards.hasFunkeRefreshUrl,
        target: FunkeC2ShareMachineStateTypes.authenticate,
      },
    },
  },
  authenticate: {
    on: {
      PREVIOUS: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
      NEXT: FunkeC2ShareMachineStateTypes.retrievePIDCredentials,
    },
  },
  retrievePIDCredentials: {
    invoke: {
      src: FunkeC2ShareMachineServices.retrievePIDCredentials,
      onDone: {
        target: FunkeC2ShareMachineStateTypes.acceptShareCredential,
        actions: assign({pidCredentials: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Array<MappedCredential>>) => _event.data}),
      },
      onError: {
        target: FunkeC2ShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_machine_retrieve_credentials_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  acceptShareCredential: {
    on: {
      PREVIOUS: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
      NEXT: FunkeC2ShareMachineStateTypes.retrievePIDCredentials,
    },
  },
  sendResponse: {
    id: FunkeC2ShareMachineStateTypes.sendResponse,
    invoke: {
      src: FunkeC2ShareMachineServices.sendResponse,
      onDone: {
        target: FunkeC2ShareMachineStateTypes.done,
      },
      onError: {
        target: FunkeC2ShareMachineStateTypes.handleError,
        actions: assign({
          error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
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
        target: FunkeC2ShareMachineStateTypes.error,
      },
      NEXT: {
        target: FunkeC2ShareMachineStateTypes.error,
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

const createFunkeCShareMachine = (opts: FunkeC2ShareMachineOpts): FunkeC2ShareStateMachine => {
  const {url, idOpts} = opts;

  const initialContext: FunkeC2ShareMachineContext = {
    url: new URL(url).toString(),
    idOpts,
    pidCredentials: [],
  };

  return createMachine<FunkeC2ShareMachineContext, FunkeC2ShareMachineEventTypes>({
    id: opts?.machineId ?? 'FunkeCShare',
    predictableActionArguments: true,
    initial: FunkeC2ShareMachineStateTypes.createConfig,
    schema: {
      events: {} as FunkeC2ShareMachineEventTypes,
      guards: {} as {
        type: FunkeC2ShareMachineGuards.hasFunkeRefreshUrl;
      },
      services: {} as {
        [FunkeC2ShareMachineServices.createConfig]: {
          data: CreateConfigResult;
        };
        [FunkeC2ShareMachineServices.getSiopRequest]: {
          data: Siopv2AuthorizationRequestData;
        };
        [FunkeC2ShareMachineServices.retrieveContact]: {
          data: Party | undefined;
        };
        [FunkeC2ShareMachineServices.retrievePIDCredentials]: {
          data: Array<MappedCredential>;
        };
        [FunkeC2ShareMachineServices.sendResponse]: {
          data: Siopv2AuthorizationResponseData;
        };
      },
    },
    context: initialContext,
    states: funkeCShareMachineStates,
  });
};

export class FunkeC2ShareMachine {
  private static _instance: FunkeC2ShareMachineInterpreter | undefined;

  static hasInstance(): boolean {
    return FunkeC2ShareMachine._instance !== undefined;
  }

  static get instance(): FunkeC2ShareMachineInterpreter {
    if (!FunkeC2ShareMachine._instance) {
      throw Error('Please initialize a funkeCShare machine first');
    }
    return FunkeC2ShareMachine._instance;
  }

  static clearInstance(opts: {stop: boolean}) {
    const {stop} = opts;
    if (FunkeC2ShareMachine.hasInstance()) {
      if (stop) {
        this.stopInstance();
      }
    }
    FunkeC2ShareMachine._instance = undefined;
  }

  static stopInstance(): void {
    debug(`Stopping funkeCShare instance...`);
    if (!FunkeC2ShareMachine.hasInstance()) {
      debug(`No funkeCShare instance present to stop`);
      return;
    }
    FunkeC2ShareMachine.instance.stop();
    FunkeC2ShareMachine._instance = undefined;
    debug(`Stopped funkeCShare instance`);
  }

  public static newInstance(opts: InstanceFunkeC2ShareMachineOpts): FunkeC2ShareMachineInterpreter {
    debug(`Creating new funkeCShare instance`, opts);
    const newInst: FunkeC2ShareMachineInterpreter = interpret(
      createFunkeCShareMachine(opts).withConfig({
        services: {
          [FunkeC2ShareMachineServices.createConfig]: siopCreateConfig,
          [FunkeC2ShareMachineServices.getSiopRequest]: siopGetSiopRequest,
          [FunkeC2ShareMachineServices.retrieveContact]: siopRetrieveContact,
          [FunkeC2ShareMachineServices.retrievePIDCredentials]: retrievePIDCredentials,
          [FunkeC2ShareMachineServices.sendResponse]: siopSendResponse,
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
      newInst.onTransition((snapshot: FunkeC2ShareMachineState): void => {
        void funkeC2ShareStateNavigationListener(newInst, snapshot);
      });
    }
    debug(`New funkeCShare instance created`, opts);
    return newInst;
  }

  static getInstance(
    opts: InstanceFunkeC2ShareMachineOpts & {
      requireExisting?: boolean;
    },
  ): FunkeC2ShareMachineInterpreter {
    if (!FunkeC2ShareMachine._instance) {
      if (opts?.requireExisting === true) {
        throw Error(`Existing funkeCShare instance requested, but none was created at this point!`);
      }
      FunkeC2ShareMachine._instance = FunkeC2ShareMachine.newInstance(opts);
    }
    return FunkeC2ShareMachine._instance;
  }
}
