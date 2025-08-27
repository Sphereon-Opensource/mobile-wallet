import {ClientMetadataOpts, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {DidAuthConfig, Identity, Party} from '@sphereon/ssi-sdk.data-store';
import {assign, createMachine, DoneInvokeEvent, interpret} from 'xstate';
import {translate} from '../localization/Localization';
import {siopV2StateNavigationListener} from '../navigation/machines/siopV2StateNavigation';
import {
  addContactIdentity,
  createConfig,
  getFederationTrust,
  getSiopRequest,
  retrieveContact,
  sendResponse,
} from '../services/machines/siopV2MachineService';
import {ErrorDetails} from '../types';
import {
  ContactAliasEvent,
  CreateContactEvent,
  CreateSiopV2MachineOpts,
  SelectCredentialsEvent,
  SiopV2AuthorizationRequestData,
  SiopV2MachineAddContactStates,
  SiopV2MachineContext,
  SiopV2MachineEvents,
  SiopV2MachineEventTypes,
  SiopV2MachineGuards,
  SiopV2MachineInstanceOpts,
  SiopV2MachineInterpreter,
  SiopV2MachineServices,
  SiopV2MachineState,
  SiopV2MachineStates,
  SiopV2StateMachine,
} from '../types/machines/siopV2';
import {ActionType, DefaultActionSubType, InitiatorType, LogLevel, SubSystem, System} from '@sphereon/ssi-types';
import store from '../store';
import {storeActivityLogging} from '../store/actions/logging.actions';
import {ExternalIdentifierOIDFEntityIdResult, TrustedAnchor} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {AuthorizationServerMetadata, CredentialIssuerMetadata} from '@sphereon/oid4vci-common';
import { DcqlQuery } from 'dcql'
import { convertToDcqlCredentials } from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth'

const siopV2HasNoContactGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact === undefined;
};

const siopV2HasContactGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact !== undefined;
};

const siopV2ContactHasLowTrustGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {contact, trustedAnchors} = _ctx;
  return contact !== undefined && trustedAnchors !== undefined && trustedAnchors.length === 0;
};

const siopV2CreateContactGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {contactAlias, hasContactConsent} = _ctx;

  return hasContactConsent && contactAlias !== undefined && contactAlias.length > 0;
};

const siopV2HasSelectedRequiredCredentialsGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const { authorizationRequestData } = _ctx;

  if (authorizationRequestData === undefined) {
    throw new Error('Missing authorization request data in context');
  }

  if (authorizationRequestData.dcqlQuery === undefined) {
    throw Error('No DCQL query present');
  }

  // FIXME: Return true for now, given this is a really expensive operation and will be called in the next phase anyway
  // TODO we need dcql query can_be_satisfied check here
  return true;
};

const siopV2HasJustOneMatchGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {selectedCredentials, authorizationRequestData} = _ctx;

  if (authorizationRequestData === undefined) {
    throw new Error('Missing authorization request data in context');
  }

  if (authorizationRequestData.dcqlQuery === undefined) {
    throw Error('No DCQL query present');
  }

  const queryResult = DcqlQuery.query(authorizationRequestData.dcqlQuery, selectedCredentials.map((vc) => convertToDcqlCredentials(vc)))

  const hasOnlyOneMatch = Object.values(queryResult.credential_matches).every(entry =>
    entry.valid_credentials && entry.valid_credentials.length === 1
  )

  return hasOnlyOneMatch && queryResult.can_be_satisfied
};

const siopV2IsSiopOnlyGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {authorizationRequestData} = _ctx;

  if (authorizationRequestData === undefined) {
    throw new Error('Missing authorization request data in context');
  }

  return authorizationRequestData.dcqlQuery === undefined;
};

const siopV2IsSiopWithOID4VPGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {authorizationRequestData} = _ctx;

  if (!authorizationRequestData) {
    throw new Error('Missing authorization request data in context');
  }

  return authorizationRequestData.dcqlQuery !== undefined;
};

const siopV2IsOIDFOriginGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  // TODO in the future we need to establish if a origin is a IDF origin. So we need to check if this metadata is on the well-known location
  const {trustAnchors, authorizationRequestData} = _ctx;
  return trustAnchors.length > 0 && authorizationRequestData?.clientIdScheme === 'entity_id';
};

const createSiopV2Machine = (opts: CreateSiopV2MachineOpts): SiopV2StateMachine => {
  const {url} = opts;
  const initialContext: SiopV2MachineContext = {
    url: new URL(url).toString(),
    trustAnchors: opts?.trustAnchors ?? [],
    hasContactConsent: true,
    contactAlias: '',
    selectedCredentials: [],
  };

  return createMachine<SiopV2MachineContext, SiopV2MachineEventTypes>(
    {
      id: opts?.machineId ?? 'SIOPV2',
      predictableActionArguments: true,
      initial: SiopV2MachineStates.createConfig,
      schema: {
        events: {} as SiopV2MachineEventTypes,
        guards: {} as
          | {type: SiopV2MachineGuards.hasNoContactGuard}
          | {type: SiopV2MachineGuards.hasContactGuard}
          | {type: SiopV2MachineGuards.createContactGuard}
          | {type: SiopV2MachineGuards.hasSelectedRequiredCredentialsGuard}
          | {type: SiopV2MachineGuards.isOIDFOriginGuard}
          | {type: SiopV2MachineGuards.contactHasLowTrustGuard},
        services: {} as {
          [SiopV2MachineServices.createConfig]: {
            data: DidAuthConfig;
          };
          [SiopV2MachineServices.getSiopRequest]: {
            data: VerifiedAuthorizationRequest;
          };
          [SiopV2MachineServices.retrieveContact]: {
            data: Party | undefined;
          };
          [SiopV2MachineServices.addContactIdentity]: {
            data: void;
          };
          [SiopV2MachineServices.sendResponse]: {
            data: void;
          };
          [SiopV2MachineServices.getFederationTrust]: {
            data: ExternalIdentifierOIDFEntityIdResult;
          };
        },
      },
      context: initialContext,
      states: {
        [SiopV2MachineStates.createConfig]: {
          id: SiopV2MachineStates.createConfig,
          invoke: {
            src: SiopV2MachineServices.createConfig,
            onDone: {
              target: SiopV2MachineStates.getSiopRequest,
              actions: assign({
                didAuthConfig: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<DidAuthConfig>) => _event.data,
              }),
            },
            onError: {
              target: SiopV2MachineStates.handleError,
              actions: assign({
                error: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('siopV2_machine_create_config_error_title'),
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [SiopV2MachineStates.getSiopRequest]: {
          id: SiopV2MachineStates.getSiopRequest,
          invoke: {
            src: SiopV2MachineServices.getSiopRequest,
            onDone: {
              target: SiopV2MachineStates.retrieveContact,
              actions: assign({
                authorizationRequestData: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<SiopV2AuthorizationRequestData>) => _event.data,
              }),
            },
            onError: {
              target: SiopV2MachineStates.handleError,
              actions: assign({
                error: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('siopV2_machine_get_request_error_title'),
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [SiopV2MachineStates.retrieveContact]: {
          id: SiopV2MachineStates.retrieveContact,
          invoke: {
            src: SiopV2MachineServices.retrieveContact,
            onDone: [
              {
                target: SiopV2MachineStates.getFederationTrust,
                cond: SiopV2MachineGuards.isOIDFOriginGuard,
                actions: assign({contact: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Party>) => _event.data}),
              },
              {
                target: SiopV2MachineStates.transitionFromSetup,
                actions: assign({contact: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Party>) => _event.data}),
              },
            ],
            onError: {
              target: SiopV2MachineStates.handleError,
              actions: assign({
                error: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('siopV2_machine_retrieve_contact_error_title'),
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [SiopV2MachineStates.getFederationTrust]: {
          id: SiopV2MachineStates.getFederationTrust,
          invoke: {
            src: SiopV2MachineServices.getFederationTrust,
            onDone: {
              target: SiopV2MachineStates.transitionFromSetup,
              actions: [
                assign({
                  trustedAnchors: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Array<TrustedAnchor>>) => _event.data,
                }),
                assign({
                  oauth_authorization_server: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<AuthorizationServerMetadata>) => _event.data,
                  openid_wallet_provider: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<AuthorizationServerMetadata>) => _event.data,
                }),
                assign({
                  openid_credential_issuer: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<CredentialIssuerMetadata>) => _event.data,
                }),
                assign({
                  openid_credential_verifier: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<ClientMetadataOpts>) => _event.data,
                }),
                assign({
                  federation_entity: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<any>) => _event.data,
                }),
              ],
            },
            onError: {
              target: SiopV2MachineStates.handleError,
              actions: assign({
                error: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('siopV2_machine_retrieve_federation_trust_error_title'),
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [SiopV2MachineStates.transitionFromSetup]: {
          id: SiopV2MachineStates.transitionFromSetup,
          always: [
            {
              target: SiopV2MachineStates.addContact,
              cond: SiopV2MachineGuards.hasNoContactGuard,
            },
            {
              target: SiopV2MachineStates.reviewContact,
              cond: SiopV2MachineGuards.contactHasLowTrustGuard,
            },
            {
              target: SiopV2MachineStates.sendResponse,
              cond: SiopV2MachineGuards.siopOnlyGuard,
            },
            {
              target: SiopV2MachineStates.selectCredentials,
              cond: SiopV2MachineGuards.siopWithOID4VPGuard,
            },
            {
              target: SiopV2MachineStates.selectCredentialOverview,
              cond: SiopV2MachineGuards.hasJustOneMatchGuard,
            },
          ],
        },
        [SiopV2MachineStates.selectCredentialOverview]: {
          id: SiopV2MachineStates.selectCredentialOverview,
          on: {
            [SiopV2MachineEvents.NEXT]: {
              target: SiopV2MachineStates.sendResponse,
              cond: SiopV2MachineGuards.hasSelectedRequiredCredentialsGuard,
            },
            [SiopV2MachineEvents.DECLINE]: {
              target: SiopV2MachineStates.declined,
            },
            [SiopV2MachineEvents.PREVIOUS]: {
              target: SiopV2MachineStates.aborted,
            },
          },
        },
        [SiopV2MachineStates.addContact]: {
          id: SiopV2MachineStates.addContact,
          initial: SiopV2MachineAddContactStates.idle,
          on: {
            [SiopV2MachineEvents.SET_CONTACT_ALIAS]: {
              actions: assign({contactAlias: (_ctx: SiopV2MachineContext, _event: ContactAliasEvent) => _event.data}),
            },
            [SiopV2MachineEvents.CREATE_CONTACT]: {
              target: `.${SiopV2MachineAddContactStates.next}`,
              actions: assign({contact: (_ctx: SiopV2MachineContext, _event: CreateContactEvent) => _event.data}),
              cond: SiopV2MachineGuards.createContactGuard,
            },
            [SiopV2MachineEvents.DECLINE]: {
              target: SiopV2MachineStates.declined,
            },
            [SiopV2MachineEvents.PREVIOUS]: {
              target: SiopV2MachineStates.aborted,
            },
          },
          states: {
            [SiopV2MachineAddContactStates.idle]: {},
            [SiopV2MachineAddContactStates.next]: {
              always: {
                target: `#${SiopV2MachineStates.transitionFromContactSetup}`,
                cond: SiopV2MachineGuards.hasContactGuard,
              },
            },
          },
        },
        [SiopV2MachineStates.reviewContact]: {
          id: SiopV2MachineStates.reviewContact,
          on: {
            [SiopV2MachineEvents.NEXT]: {
              target: SiopV2MachineStates.transitionFromContactSetup,
            },
            [SiopV2MachineEvents.DECLINE]: {
              target: SiopV2MachineStates.declined,
            },
            [SiopV2MachineEvents.PREVIOUS]: {
              target: SiopV2MachineStates.aborted,
            },
          },
        },
        [SiopV2MachineStates.transitionFromContactSetup]: {
          id: SiopV2MachineStates.transitionFromContactSetup,
          always: [
            {
              target: SiopV2MachineStates.sendResponse,
              cond: SiopV2MachineGuards.siopOnlyGuard,
            },
            {
              target: SiopV2MachineStates.selectCredentials,
              cond: SiopV2MachineGuards.siopWithOID4VPGuard,
            },
            {
              target: SiopV2MachineStates.selectCredentialOverview,
              cond: SiopV2MachineGuards.hasJustOneMatchGuard,
            },
          ],
        },
        [SiopV2MachineStates.addContactIdentity]: {
          id: SiopV2MachineStates.addContactIdentity,
          invoke: {
            src: SiopV2MachineServices.addContactIdentity,
            onDone: [
              {
                target: SiopV2MachineStates.selectCredentials,
                actions: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Identity>): void => {
                  _ctx.contact?.identities.push(_event.data);
                },
                cond: SiopV2MachineGuards.siopWithOID4VPGuard,
              },
              {
                target: SiopV2MachineStates.sendResponse,
                actions: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Identity>): void => {
                  _ctx.contact?.identities.push(_event.data);
                },
                cond: SiopV2MachineGuards.siopOnlyGuard,
              },
            ],
            onError: {
              target: SiopV2MachineStates.handleError,
              actions: assign({
                error: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('siopV2_machine_add_contact_identity_error_title'),
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [SiopV2MachineStates.selectCredentials]: {
          id: SiopV2MachineStates.selectCredentials,
          on: {
            [SiopV2MachineEvents.SET_SELECTED_CREDENTIALS]: {
              actions: assign({selectedCredentials: (_ctx: SiopV2MachineContext, _event: SelectCredentialsEvent) => _event.data}),
            },
            [SiopV2MachineEvents.NEXT]: {
              target: SiopV2MachineStates.sendResponse,
              cond: SiopV2MachineGuards.hasSelectedRequiredCredentialsGuard,
            },
            [SiopV2MachineEvents.DECLINE]: {
              actions: 'logDeclineShare',
              target: SiopV2MachineStates.declined,
            },
            [SiopV2MachineEvents.PREVIOUS]: {
              target: SiopV2MachineStates.aborted,
            },
          },
        },
        [SiopV2MachineStates.sendResponse]: {
          id: SiopV2MachineStates.sendResponse,
          invoke: {
            src: SiopV2MachineServices.sendResponse,
            onDone: {
              target: SiopV2MachineStates.done,
            },
            onError: {
              target: SiopV2MachineStates.handleError,
              actions: assign({
                error: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                  title: translate('siopV2_machine_send_response_error_title'),
                  message: _event.data.message,
                }),
              }),
            },
          },
        },
        [SiopV2MachineStates.handleError]: {
          id: SiopV2MachineStates.handleError,
          on: {
            [SiopV2MachineEvents.NEXT]: {
              target: SiopV2MachineStates.error,
            },
            [SiopV2MachineEvents.PREVIOUS]: {
              target: SiopV2MachineStates.error,
            },
          },
        },
        [SiopV2MachineStates.aborted]: {
          id: SiopV2MachineStates.aborted,
          type: 'final',
        },
        [SiopV2MachineStates.declined]: {
          id: SiopV2MachineStates.declined,
          type: 'final',
        },
        [SiopV2MachineStates.error]: {
          id: SiopV2MachineStates.error,
          type: 'final',
        },
        [SiopV2MachineStates.done]: {
          id: SiopV2MachineStates.done,
          type: 'final',
        },
      },
    },
    {
      actions: {
        logDeclineShare: async (context, event) => {
          //const pd = context.authorizationRequestData?.presentationDefinitions?.[0]?.definition;
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
              // FIXME
              //sharePurpose: pd?.purpose,
              diagnosticData: context.authorizationRequestData?.dcqlQuery,
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

export class SiopV2Machine {
  static newInstance(opts: SiopV2MachineInstanceOpts): SiopV2MachineInterpreter {
    const instance: SiopV2MachineInterpreter = interpret(
      createSiopV2Machine(opts).withConfig({
        services: {
          [SiopV2MachineServices.createConfig]: createConfig,
          [SiopV2MachineServices.getSiopRequest]: getSiopRequest,
          [SiopV2MachineServices.retrieveContact]: retrieveContact,
          [SiopV2MachineServices.addContactIdentity]: addContactIdentity,
          [SiopV2MachineServices.sendResponse]: sendResponse,
          [SiopV2MachineServices.getFederationTrust]: getFederationTrust,
          ...opts?.services,
        },
        guards: {
          siopV2HasNoContactGuard,
          siopV2HasContactGuard,
          siopV2CreateContactGuard,
          siopV2HasSelectedRequiredCredentialsGuard,
          siopV2IsSiopOnlyGuard,
          siopV2HasJustOneMatchGuard,
          siopV2IsSiopWithOID4VPGuard,
          siopV2IsOIDFOriginGuard,
          siopV2ContactHasLowTrustGuard,
          ...opts?.guards,
        },
      }),
    );

    if (typeof opts?.subscription === 'function') {
      instance.onTransition(opts.subscription);
    }
    if (opts?.requireCustomNavigationHook !== true) {
      instance.onTransition((snapshot: SiopV2MachineState): void => {
        void siopV2StateNavigationListener(instance, snapshot);
      });
    }
    instance.onTransition((snapshot: SiopV2MachineState): void => {
      console.log(snapshot.value);
    });

    return instance;
  }
}
