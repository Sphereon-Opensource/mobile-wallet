import {assign, createMachine, DoneInvokeEvent, interpret} from 'xstate';
import Debug, {Debugger} from 'debug';
import {funkeC2ShareStateNavigationListener} from '../navigation/machines/funkeC2ShareStateNavigation';
import {APP_ID} from '../@config/constants';
import {
  ContactAliasEvent,
  CreateContactEvent,
  FunkeC2ShareMachineAddContactStates,
  FunkeC2ShareMachineContext,
  FunkeC2ShareMachineEvents,
  FunkeC2ShareMachineEventTypes,
  FunkeC2ShareMachineGuard,
  FunkeC2ShareMachineGuards,
  FunkeC2ShareMachineInterpreter,
  FunkeC2ShareMachineOpts,
  FunkeC2ShareMachineServices,
  FunkeC2ShareMachineState,
  FunkeC2ShareMachineStateTypes,
  FunkeC2ShareStateMachine,
  InstanceFunkeC2ShareMachineOpts,
  SiopV2AuthorizationRequestData,
} from '../types/machines/funkeC2ShareMachine';
import {DidAuthConfig, Party} from '@sphereon/ssi-sdk.data-store-types';
import {ErrorDetails} from '../types';
import {translate} from '../localization/Localization';
import {MappedCredential} from '../types/machines/getPIDCredentialMachine';
import {CreateConfigResult, Siopv2AuthorizationRequestData, Siopv2AuthorizationResponseData} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import {
  fetchVerifiableCredentials,
  getFederationTrust,
  retrievePIDCredentials,
  siopCreateConfig,
  siopGetSiopRequest,
  siopRetrieveContact,
  siopSendResponse,
  storeCredentialBranding,
  storePIDCredentials,
} from '../services/machines/funkeC2ShareMachineService';
import {ActionType, DefaultActionSubType, InitiatorType, LogLevel, SubSystem, System} from '@sphereon/ssi-types';
import store from '../store';
import {storeActivityLogging} from '../store/actions/logging.actions';

const debug: Debugger = Debug(`${APP_ID}:funkeCShare`);

const hasFunkeRefreshUrl: FunkeC2ShareMachineGuard = ({funkeProvider}) => funkeProvider?.refreshUrl !== undefined;

const funkeC2CreateContactGuard = (_ctx: FunkeC2ShareMachineContext, _event: FunkeC2ShareMachineEventTypes): boolean => {
  const {contactAlias} = _ctx;
  return contactAlias !== undefined && contactAlias.length > 0;
};

const funkeC2HasContactGuard = (_ctx: FunkeC2ShareMachineContext, _event: FunkeC2ShareMachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact !== undefined;
};

const funkeC2HasNoContactGuard = (_ctx: FunkeC2ShareMachineContext, _event: FunkeC2ShareMachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact === undefined;
};

const funkeC2ContactHasLowTrustGuard = (_ctx: FunkeC2ShareMachineContext, _event: FunkeC2ShareMachineEventTypes): boolean => {
  const {contact, trustedAnchors} = _ctx;
  return contact !== undefined && trustedAnchors !== undefined && trustedAnchors.length === 0;
};

const funkeC2IsOIDFOriginGuard = (_ctx: FunkeC2ShareMachineContext, _event: FunkeC2ShareMachineEventTypes): boolean => {
  // TODO in the future we need to establish if a origin is a IDF origin. So we need to check if this metadata is on the well-known location
  const {trustAnchors} = _ctx;
  return trustAnchors.length > 0;
};

const createFunkeCShareMachine = (opts: FunkeC2ShareMachineOpts): FunkeC2ShareStateMachine => {
  const {url, idOpts} = opts;

  const initialContext: FunkeC2ShareMachineContext = {
    url: new URL(url).toString(),
    idOpts,
    pidCredentials: [],
    contactAlias: '',
    trustAnchors: opts?.trustAnchors ?? [],
  };

  return createMachine<FunkeC2ShareMachineContext, FunkeC2ShareMachineEventTypes>(
    {
      id: opts?.machineId ?? 'FunkeC2Share',
      predictableActionArguments: true,
      initial: FunkeC2ShareMachineStateTypes.createConfig,
      schema: {
        events: {} as FunkeC2ShareMachineEventTypes,
        guards: {} as
          | {type: FunkeC2ShareMachineGuards.hasFunkeRefreshUrl}
          | {type: FunkeC2ShareMachineGuards.createContactGuard}
          | {type: FunkeC2ShareMachineGuards.hasContactGuard}
          | {type: FunkeC2ShareMachineGuards.hasNoContactGuard}
          | {type: FunkeC2ShareMachineGuards.contactHasLowTrustGuard}
          | {type: FunkeC2ShareMachineGuards.isOIDFOriginGuard},
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
          [FunkeC2ShareMachineServices.storePIDCredentials]: {
            data: void;
          };
          [FunkeC2ShareMachineServices.storeCredentialBranding]: {
            data: void;
          };
          [FunkeC2ShareMachineServices.fetchCredentialsInStore]: {
            data: void;
          };
        },
      },
      context: initialContext,
      states: {
        [FunkeC2ShareMachineStateTypes.createConfig]: {
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
        [FunkeC2ShareMachineStateTypes.getSiopRequest]: {
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
        [FunkeC2ShareMachineStateTypes.retrieveContact]: {
          id: FunkeC2ShareMachineStateTypes.retrieveContact,
          invoke: {
            src: FunkeC2ShareMachineServices.retrieveContact,
            onDone: [
              {
                target: FunkeC2ShareMachineStateTypes.getFederationTrust,
                cond: FunkeC2ShareMachineGuards.isOIDFOriginGuard,
                actions: assign({contact: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Party>) => _event.data}),
              },
              {
                target: FunkeC2ShareMachineStateTypes.transitionFromSetup,
                actions: assign({contact: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Party>) => _event.data}),
              },
            ],
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
        [FunkeC2ShareMachineStateTypes.getFederationTrust]: {
          id: FunkeC2ShareMachineStateTypes.getFederationTrust,
          invoke: {
            src: FunkeC2ShareMachineServices.getFederationTrust,
            onDone: {
              target: FunkeC2ShareMachineStateTypes.transitionFromSetup,
              actions: assign({
                trustedAnchors: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Array<string>>) => _event.data,
              }),
            },
            onError: {
              target: FunkeC2ShareMachineStateTypes.handleError,
              actions: assign({
                error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('siopV2_machine_retrieve_federation_trust_error_title'), // TODO
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.transitionFromSetup]: {
          id: FunkeC2ShareMachineStateTypes.transitionFromSetup,
          always: [
            {
              target: FunkeC2ShareMachineStateTypes.addContact,
              cond: FunkeC2ShareMachineGuards.hasNoContactGuard,
            },
            {
              target: FunkeC2ShareMachineStateTypes.reviewContact,
              cond: FunkeC2ShareMachineGuards.contactHasLowTrustGuard,
            },
          ],
        },
        [FunkeC2ShareMachineStateTypes.addContact]: {
          id: FunkeC2ShareMachineStateTypes.addContact,
          initial: FunkeC2ShareMachineAddContactStates.idle,
          on: {
            [FunkeC2ShareMachineEvents.SET_CONTACT_ALIAS]: {
              actions: assign({contactAlias: (_ctx: FunkeC2ShareMachineContext, _event: ContactAliasEvent) => _event.data}),
            },
            [FunkeC2ShareMachineEvents.CREATE_CONTACT]: {
              target: `.${FunkeC2ShareMachineAddContactStates.next}`,
              actions: assign({contact: (_ctx: FunkeC2ShareMachineContext, _event: CreateContactEvent) => _event.data}),
              cond: FunkeC2ShareMachineGuards.createContactGuard,
            },
            [FunkeC2ShareMachineEvents.DECLINE]: {
              target: FunkeC2ShareMachineStateTypes.declined,
            },
            [FunkeC2ShareMachineEvents.PREVIOUS]: {
              target: FunkeC2ShareMachineStateTypes.aborted,
            },
          },
          states: {
            [FunkeC2ShareMachineAddContactStates.idle]: {},
            [FunkeC2ShareMachineAddContactStates.next]: {
              always: {
                target: `#${FunkeC2ShareMachineStateTypes.acceptRequestInformation}`,
                cond: FunkeC2ShareMachineGuards.hasContactGuard,
              },
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.reviewContact]: {
          id: FunkeC2ShareMachineStateTypes.reviewContact,
          on: {
            [FunkeC2ShareMachineEvents.NEXT]: {
              target: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
            },
            [FunkeC2ShareMachineEvents.DECLINE]: {
              target: FunkeC2ShareMachineStateTypes.declined,
            },
            [FunkeC2ShareMachineEvents.PREVIOUS]: {
              target: FunkeC2ShareMachineStateTypes.aborted,
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.acceptRequestInformation]: {
          id: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
          on: {
            PREVIOUS: {
              target: FunkeC2ShareMachineStateTypes.aborted,
            },
            NEXT: {
              target: FunkeC2ShareMachineStateTypes.authenticateAusweisEID,
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.authenticateAusweisEID]: {
          id: FunkeC2ShareMachineStateTypes.authenticateAusweisEID,
          on: {
            PREVIOUS: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
            SET_FUNKE_PROVIDER: {actions: assign({funkeProvider: (_, event) => event.data})},
            NEXT: {
              cond: FunkeC2ShareMachineGuards.hasFunkeRefreshUrl,
              target: FunkeC2ShareMachineStateTypes.authenticate,
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.authenticate]: {
          id: FunkeC2ShareMachineStateTypes.authenticate,
          on: {
            PREVIOUS: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
            NEXT: FunkeC2ShareMachineStateTypes.retrievePIDCredentials,
          },
        },
        [FunkeC2ShareMachineStateTypes.retrievePIDCredentials]: {
          id: FunkeC2ShareMachineStateTypes.retrievePIDCredentials,
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
        [FunkeC2ShareMachineStateTypes.acceptShareCredential]: {
          id: FunkeC2ShareMachineStateTypes.acceptShareCredential,
          on: {
            PREVIOUS: FunkeC2ShareMachineStateTypes.acceptRequestInformation,
            NEXT: FunkeC2ShareMachineStateTypes.sendResponse,
            DECLINE: {
              actions: 'logDeclineShare',
              target: FunkeC2ShareMachineStateTypes.declined,
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.sendResponse]: {
          id: FunkeC2ShareMachineStateTypes.sendResponse,
          invoke: {
            src: FunkeC2ShareMachineServices.sendResponse,
            onDone: {
              target: FunkeC2ShareMachineStateTypes.storePIDCredentials,
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
        [FunkeC2ShareMachineStateTypes.storePIDCredentials]: {
          id: FunkeC2ShareMachineStateTypes.storePIDCredentials,
          invoke: {
            src: FunkeC2ShareMachineServices.storePIDCredentials,
            onDone: {
              target: FunkeC2ShareMachineStateTypes.storeCredentialBranding,
            },
            onError: {
              target: FunkeC2ShareMachineStateTypes.handleError,
              actions: assign({
                error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('onboarding_machine_store_credential_error_title'),
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.storeCredentialBranding]: {
          id: FunkeC2ShareMachineStateTypes.storeCredentialBranding,
          invoke: {
            src: FunkeC2ShareMachineServices.storeCredentialBranding,
            onDone: {
              target: FunkeC2ShareMachineStateTypes.fetchCredentialsInStore,
            },
            onError: {
              target: FunkeC2ShareMachineStateTypes.handleError,
              actions: assign({
                error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('onboarding_store_credential_branding_error_title'),
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.fetchCredentialsInStore]: {
          id: FunkeC2ShareMachineStateTypes.fetchCredentialsInStore,
          invoke: {
            src: FunkeC2ShareMachineServices.fetchCredentialsInStore,
            onDone: {
              target: FunkeC2ShareMachineStateTypes.done,
            },
            onError: {
              target: FunkeC2ShareMachineStateTypes.handleError,
              actions: assign({
                error: (_ctx: FunkeC2ShareMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: 'Fetch credential in store',
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.handleError]: {
          id: FunkeC2ShareMachineStateTypes.handleError,
          on: {
            PREVIOUS: {
              target: FunkeC2ShareMachineStateTypes.error,
            },
            NEXT: {
              target: FunkeC2ShareMachineStateTypes.error,
            },
          },
        },
        [FunkeC2ShareMachineStateTypes.error]: {
          id: FunkeC2ShareMachineStateTypes.error,
          type: 'final',
        },
        [FunkeC2ShareMachineStateTypes.declined]: {
          id: FunkeC2ShareMachineStateTypes.declined,
          type: 'final',
        },
        [FunkeC2ShareMachineStateTypes.aborted]: {
          id: FunkeC2ShareMachineStateTypes.aborted,
          type: 'final',
        },
        [FunkeC2ShareMachineStateTypes.done]: {
          id: FunkeC2ShareMachineStateTypes.done,
          type: 'final',
        },
      },
    },
    {
      actions: {
        logDeclineShare: async (context, event) => {
          const pd = (context.authorizationRequestData as any)?.presentationDefinitions?.[0]?.definition;
          store.dispatch<any>(
            storeActivityLogging({
              level: LogLevel.INFO,
              system: System.OID4VP,
              subSystemType: SubSystem.OID4VP_OP,
              initiatorType: InitiatorType.USER,
              description: 'Credential was declined by the user',
              actionType: ActionType.READ,
              actionSubType: DefaultActionSubType.VC_SHARE_DECLINE,
              correlationId: context.didAuthConfig?.sessionId,
              sharePurpose: pd?.purpose,
              diagnosticData: (context.authorizationRequestData as any)?.presentationDefinitions,
              // @ts-ignore
              partyCorrelationType: context.contact?.identities[0].identifier.type, // TODO fix types
              partyCorrelationId: context.contact?.identities[0].identifier.correlationId,
              partyAlias: context.contact?.contact.displayName,
            }),
          );
        },
      },
    },
  );
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
          [FunkeC2ShareMachineServices.storePIDCredentials]: storePIDCredentials,
          [FunkeC2ShareMachineServices.storeCredentialBranding]: storeCredentialBranding,
          [FunkeC2ShareMachineServices.fetchCredentialsInStore]: fetchVerifiableCredentials,
          [FunkeC2ShareMachineServices.getFederationTrust]: getFederationTrust,
          ...opts?.services,
        },
        guards: {
          funkeC2CreateContactGuard,
          hasFunkeRefreshUrl,
          funkeC2HasContactGuard,
          funkeC2HasNoContactGuard,
          funkeC2ContactHasLowTrustGuard,
          funkeC2IsOIDFOriginGuard,
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
