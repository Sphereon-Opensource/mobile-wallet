import {AuthzFlowType, toAuthorizationResponsePayload} from '@sphereon/oid4vci-common';
import {Identity, Party} from '@sphereon/ssi-sdk.data-store';
import {assign, createMachine, DoneInvokeEvent, interpret} from 'xstate';
import {translate} from '../localization/Localization';
import {oid4vciStateNavigationListener} from '../navigation/machines/oid4vciStateNavigation';
import OpenId4VcIssuanceProvider from '../providers/credential/OpenId4VcIssuanceProvider';
import {
  addContactIdentity,
  assertValidCredentials,
  createCredentialSelection,
  initiateOpenId4VcIssuanceProvider,
  retrieveContact,
  retrieveCredentials,
  storeCredentialBranding,
  storeCredentials,
} from '../services/machines/oid4vciMachineService';
import {ErrorDetails, ICredentialTypeSelection} from '../types';
import {
  AuthorizationResponseEvent,
  ContactAliasEvent,
  ContactConsentEvent,
  CreateContactEvent,
  CreateOID4VCIMachineOpts,
  MappedCredentialToAccept,
  OID4VCIMachineAddContactStates,
  OID4VCIMachineContext,
  OID4VCIMachineEvents,
  OID4VCIMachineEventTypes,
  OID4VCIMachineGuards,
  OID4VCIMachineInstanceOpts,
  OID4VCIMachineInterpreter,
  OID4VCIMachineServices,
  OID4VCIMachineState,
  OID4VCIMachineStates,
  OID4VCIMachineVerifyPinStates,
  OID4VCIStateMachine,
  SelectCredentialsEvent,
  SetAuthorizationCodeURLEvent,
  VerificationCodeEvent,
} from '../types/machines/oid4vci';

const oid4vciHasNoContactGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact === undefined;
};

const oid4vciHasContactGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact !== undefined;
};

const oid4vciSelectCredentialsGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {credentialSelection} = _ctx;
  return credentialSelection.length > 1;
};

const oid4vciRequirePinGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {requestData} = _ctx;
  return requestData?.credentialOffer?.userPinRequired === true;
};

const oid4vciHasNoContactIdentityGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {contact, credentialsToAccept} = _ctx;
  return !contact?.identities!.some((identity: Identity): boolean => identity.identifier.correlationId === credentialsToAccept[0].correlationId);
};

const oid4vciVerificationCodeGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {verificationCode} = _ctx;
  return verificationCode !== undefined && verificationCode.length > 0;
};

const oid4vciRequireAuthorizationGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  console.log('oid4vciRequireAuthorizationGuard start');
  console.log(`has auth url: ${_ctx.openId4VcIssuanceProvider?.client.hasAuthorizationURL() === true}`);
  if (!_ctx.openId4VcIssuanceProvider?.client.isFlowTypeSupported(AuthzFlowType.AUTHORIZATION_CODE_FLOW)) {
    console.log('oid4vciRequireAuthorizationGuard end');
    return false;
  } else if (!_ctx.openId4VcIssuanceProvider?.client.hasAuthorizationURL()) {
    console.log('oid4vciRequireAuthorizationGuard end');
    return false;
  }
  // _ctx.authorizationCodeURL = _ctx?.openId4VcIssuanceProvider?.client.authorizationURL
  console.log(`auth url client: ${_ctx?.openId4VcIssuanceProvider?.client.authorizationURL}`);

  console.log(`auth url context: ${_ctx.authorizationCodeURL}`);

  console.log(`has access token response: ${_ctx?.openId4VcIssuanceProvider?.client.hasAccessTokenResponse()}`);
  console.log('oid4vciRequireAuthorizationGuard end');
  return _ctx.openId4VcIssuanceProvider?.client.hasAccessTokenResponse() === false;
};
const oid4vciCreateContactGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {contactAlias, hasContactConsent} = _ctx;
  return hasContactConsent && contactAlias !== undefined && contactAlias.length > 0;
};

const oid4vciHasSelectedCredentialsGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {selectedCredentials} = _ctx;
  return selectedCredentials !== undefined && selectedCredentials.length > 0;
};

const createOID4VCIMachine = (opts?: CreateOID4VCIMachineOpts): OID4VCIStateMachine => {
  const initialContext: OID4VCIMachineContext = {
    // TODO WAL-671 we need to store the data from OpenIdProvider here in the context and make sure we can restart the machine with it and init the OpenIdProvider
    requestData: opts?.requestData,
    credentialSelection: [],
    authorizationCodeURL: undefined,
    selectedCredentials: [],
    credentialsToAccept: [],
    hasContactConsent: true,
    contactAlias: '',
  };

  return createMachine<OID4VCIMachineContext, OID4VCIMachineEventTypes>({
    id: opts?.machineId ?? 'OID4VCI',
    predictableActionArguments: true,
    initial: OID4VCIMachineStates.initiateOID4VCIProvider,
    schema: {
      events: {} as OID4VCIMachineEventTypes,
      guards: {} as
        | {type: OID4VCIMachineGuards.hasNoContactGuard}
        | {type: OID4VCIMachineGuards.selectCredentialGuard}
        | {type: OID4VCIMachineGuards.requirePinGuard}
        | {type: OID4VCIMachineGuards.requireAuthorizationGuard}
        | {type: OID4VCIMachineGuards.hasNoContactIdentityGuard}
        | {type: OID4VCIMachineGuards.verificationCodeGuard}
        | {type: OID4VCIMachineGuards.hasContactGuard}
        | {type: OID4VCIMachineGuards.createContactGuard}
        | {type: OID4VCIMachineGuards.hasSelectedCredentialsGuard},
      services: {} as {
        [OID4VCIMachineServices.initiate]: {
          data: OpenId4VcIssuanceProvider;
        };
        [OID4VCIMachineServices.createCredentialSelection]: {
          data: Array<ICredentialTypeSelection>;
        };
        [OID4VCIMachineServices.retrieveContact]: {
          data: Party | undefined;
        };
        [OID4VCIMachineServices.retrieveCredentials]: {
          data: Array<MappedCredentialToAccept> | undefined;
        };
        [OID4VCIMachineServices.addContactIdentity]: {
          data: void;
        };
        [OID4VCIMachineServices.assertValidCredentials]: {
          data: void;
        };
        [OID4VCIMachineServices.storeCredentialBranding]: {
          data: void;
        };
        [OID4VCIMachineServices.storeCredentials]: {
          data: void;
        };
      },
    },
    context: initialContext,
    states: {
      [OID4VCIMachineStates.initiateOID4VCIProvider]: {
        id: OID4VCIMachineStates.initiateOID4VCIProvider,
        invoke: {
          src: OID4VCIMachineServices.initiate,
          onDone: {
            target: OID4VCIMachineStates.createCredentialSelection,
            actions: assign({
              openId4VcIssuanceProvider: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<OpenId4VcIssuanceProvider>) => _event.data,
              authorizationCodeURL: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<OpenId4VcIssuanceProvider>) =>
                _event.data.client.authorizationURL,
            }),
          },
          onError: {
            target: OID4VCIMachineStates.handleError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_initiation_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.createCredentialSelection]: {
        id: OID4VCIMachineStates.createCredentialSelection,
        invoke: {
          src: OID4VCIMachineServices.createCredentialSelection,
          onDone: {
            target: OID4VCIMachineStates.retrieveContact,
            actions: assign({
              credentialSelection: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Array<ICredentialTypeSelection>>) => _event.data,
            }),
            // TODO WAL-670 would be nice if we can have guard that checks if we have at least 1 item in the selection. not sure if this can occur but it would be more defensive.
            // Still cannot find a nice way to do this inside of an invoke besides adding another transition state
          },
          onError: {
            target: OID4VCIMachineStates.handleError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_credential_selection_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.retrieveContact]: {
        id: OID4VCIMachineStates.retrieveContact,
        invoke: {
          src: OID4VCIMachineServices.retrieveContact,
          onDone: {
            target: OID4VCIMachineStates.transitionFromSetup,
            actions: assign({contact: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Party>) => _event.data}),
          },
          onError: {
            target: OID4VCIMachineStates.handleError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_retrieve_contact_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.transitionFromSetup]: {
        id: OID4VCIMachineStates.transitionFromSetup,
        always: [
          {
            target: OID4VCIMachineStates.addContact,
            cond: OID4VCIMachineGuards.hasNoContactGuard,
          },
          {
            target: OID4VCIMachineStates.selectCredentials,
            cond: OID4VCIMachineGuards.selectCredentialGuard,
          },
          {
            target: OID4VCIMachineStates.verifyPin,
            cond: OID4VCIMachineGuards.requirePinGuard,
          },
          {
            target: OID4VCIMachineStates.initiateAuthorizationRequest,
            cond: OID4VCIMachineGuards.requireAuthorizationGuard,
          },
          {
            target: OID4VCIMachineStates.retrieveCredentials,
          },
        ],
        on: {
          [OID4VCIMachineEvents.SET_AUTHORIZATION_CODE_URL]: {
            actions: assign({authorizationCodeURL: (_ctx: OID4VCIMachineContext, _event: SetAuthorizationCodeURLEvent) => _event.data}),
          },
        },
      },

      [OID4VCIMachineStates.addContact]: {
        id: OID4VCIMachineStates.addContact,
        initial: OID4VCIMachineAddContactStates.idle,
        on: {
          [OID4VCIMachineEvents.SET_CONTACT_CONSENT]: {
            actions: assign({hasContactConsent: (_ctx: OID4VCIMachineContext, _event: ContactConsentEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.SET_CONTACT_ALIAS]: {
            actions: assign({contactAlias: (_ctx: OID4VCIMachineContext, _event: ContactAliasEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.CREATE_CONTACT]: {
            target: `.${OID4VCIMachineAddContactStates.next}`,
            actions: assign({contact: (_ctx: OID4VCIMachineContext, _event: CreateContactEvent) => _event.data}),
            cond: OID4VCIMachineGuards.createContactGuard,
          },
          [OID4VCIMachineEvents.DECLINE]: {
            target: OID4VCIMachineStates.declined,
          },
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.aborted,
          },
        },
        states: {
          [OID4VCIMachineAddContactStates.idle]: {},
          [OID4VCIMachineAddContactStates.next]: {
            always: {
              target: `#${OID4VCIMachineStates.transitionFromContactSetup}`,
              cond: OID4VCIMachineGuards.hasContactGuard,
            },
          },
        },
      },
      [OID4VCIMachineStates.transitionFromContactSetup]: {
        id: OID4VCIMachineStates.transitionFromContactSetup,
        always: [
          {
            target: OID4VCIMachineStates.selectCredentials,
            cond: OID4VCIMachineGuards.selectCredentialGuard,
          },
          {
            target: OID4VCIMachineStates.verifyPin,
            cond: OID4VCIMachineGuards.requirePinGuard,
          },
          {
            target: OID4VCIMachineStates.retrieveCredentials,
          },
        ],
      },
      [OID4VCIMachineStates.selectCredentials]: {
        id: OID4VCIMachineStates.selectCredentials,
        on: {
          [OID4VCIMachineEvents.SET_SELECTED_CREDENTIALS]: {
            actions: assign({selectedCredentials: (_ctx: OID4VCIMachineContext, _event: SelectCredentialsEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.transitionFromSelectingCredentials,
            cond: OID4VCIMachineGuards.hasSelectedCredentialsGuard,
          },
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.aborted,
          },
        },
      },
      [OID4VCIMachineStates.transitionFromSelectingCredentials]: {
        id: OID4VCIMachineStates.transitionFromSelectingCredentials,
        always: [
          {
            target: OID4VCIMachineStates.verifyPin,
            cond: OID4VCIMachineGuards.requirePinGuard,
          },
          {
            target: OID4VCIMachineStates.retrieveCredentials,
          },
        ],
      },
      [OID4VCIMachineStates.initiateAuthorizationRequest]: {
        id: OID4VCIMachineStates.initiateAuthorizationRequest,

        on: {
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.selectCredentials,
          },
          [OID4VCIMachineEvents.INVOKED_AUTHORIZATION_CODE_REQUEST]: {
            target: OID4VCIMachineStates.waitForAuthorizationResponse,
          },
        },
      },
      [OID4VCIMachineStates.waitForAuthorizationResponse]: {
        id: OID4VCIMachineStates.waitForAuthorizationResponse,
        on: {
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.initiateAuthorizationRequest,
          },
          [OID4VCIMachineEvents.PROVIDE_AUTHORIZATION_CODE_RESPONSE]: {
            target: OID4VCIMachineStates.transitionFromSelectingCredentials,
            actions: assign({
              authorizationCodeResponse: (_ctx: OID4VCIMachineContext, _event: AuthorizationResponseEvent) =>
                toAuthorizationResponsePayload(_event.data),
            }),
          },
        },
      },
      [OID4VCIMachineStates.verifyPin]: {
        id: OID4VCIMachineStates.verifyPin,
        initial: OID4VCIMachineVerifyPinStates.idle,
        on: {
          [OID4VCIMachineEvents.SET_VERIFICATION_CODE]: {
            target: `.${OID4VCIMachineVerifyPinStates.next}`,
            actions: assign({verificationCode: (_ctx: OID4VCIMachineContext, _event: VerificationCodeEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.PREVIOUS]: [
            {
              target: OID4VCIMachineStates.selectCredentials,
              cond: OID4VCIMachineGuards.selectCredentialGuard,
            },
            {
              target: OID4VCIMachineStates.aborted,
            },
          ],
        },
        states: {
          [OID4VCIMachineVerifyPinStates.idle]: {},
          [OID4VCIMachineVerifyPinStates.next]: {
            always: {
              target: `#${OID4VCIMachineStates.retrieveCredentials}`,
              cond: OID4VCIMachineGuards.verificationCodeGuard,
            },
          },
        },
      },
      [OID4VCIMachineStates.retrieveCredentials]: {
        id: OID4VCIMachineStates.retrieveCredentials,
        invoke: {
          src: OID4VCIMachineServices.retrieveCredentials,
          onDone: {
            target: OID4VCIMachineStates.verifyCredentials,
            actions: assign({
              credentialsToAccept: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Array<MappedCredentialToAccept>>) => _event.data,
            }),
          },
          onError: {
            target: OID4VCIMachineStates.handleError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_retrieve_credentials_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
        exit: assign({verificationCode: undefined}),
      },
      [OID4VCIMachineStates.verifyCredentials]: {
        id: OID4VCIMachineStates.verifyCredentials,
        invoke: {
          src: OID4VCIMachineServices.assertValidCredentials,
          onDone: {
            target: OID4VCIMachineStates.transitionFromWalletInput,
          },
          onError: {
            target: OID4VCIMachineStates.handleError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_verify_credentials_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.transitionFromWalletInput]: {
        id: OID4VCIMachineStates.transitionFromWalletInput,
        always: [
          {
            target: OID4VCIMachineStates.addContactIdentity,
            cond: OID4VCIMachineGuards.hasNoContactIdentityGuard,
          },
          {
            target: OID4VCIMachineStates.reviewCredentials,
          },
        ],
      },
      [OID4VCIMachineStates.addContactIdentity]: {
        id: OID4VCIMachineStates.addContactIdentity,
        invoke: {
          src: OID4VCIMachineServices.addContactIdentity,
          onDone: {
            target: OID4VCIMachineStates.reviewCredentials,
            actions: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Identity>): void => {
              _ctx.contact?.identities.push(_event.data);
            },
          },
          onError: {
            target: OID4VCIMachineStates.handleError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_add_contact_identity_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.reviewCredentials]: {
        id: OID4VCIMachineStates.reviewCredentials,
        on: {
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.storeCredentialBranding,
          },
          [OID4VCIMachineEvents.DECLINE]: {
            target: OID4VCIMachineStates.declined,
          },
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.aborted,
          },
        },
      },
      [OID4VCIMachineStates.storeCredentialBranding]: {
        id: OID4VCIMachineStates.storeCredentialBranding,
        invoke: {
          src: OID4VCIMachineServices.storeCredentialBranding,
          onDone: {
            target: OID4VCIMachineStates.storeCredentials,
          },
          onError: {
            target: OID4VCIMachineStates.handleError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_store_credential_branding_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.storeCredentials]: {
        id: OID4VCIMachineStates.storeCredentials,
        invoke: {
          src: OID4VCIMachineServices.storeCredentials,
          onDone: {
            target: OID4VCIMachineStates.done,
          },
          onError: {
            target: OID4VCIMachineStates.handleError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_store_credential_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.handleError]: {
        id: OID4VCIMachineStates.handleError,
        on: {
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.error,
          },
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.error,
          },
        },
      },
      [OID4VCIMachineStates.aborted]: {
        id: OID4VCIMachineStates.aborted,
        type: 'final',
      },
      [OID4VCIMachineStates.declined]: {
        id: OID4VCIMachineStates.declined,
        type: 'final',
      },
      [OID4VCIMachineStates.error]: {
        id: OID4VCIMachineStates.error,
        type: 'final',
      },
      [OID4VCIMachineStates.done]: {
        id: OID4VCIMachineStates.done,
        type: 'final',
      },
    },
  });
};

export class OID4VCIMachine {
  static newInstance(opts?: OID4VCIMachineInstanceOpts): OID4VCIMachineInterpreter {
    const instance: OID4VCIMachineInterpreter = interpret(
      createOID4VCIMachine(opts).withConfig({
        services: {
          [OID4VCIMachineServices.initiate]: initiateOpenId4VcIssuanceProvider,
          [OID4VCIMachineServices.createCredentialSelection]: createCredentialSelection,
          [OID4VCIMachineServices.retrieveContact]: retrieveContact,
          [OID4VCIMachineServices.retrieveCredentials]: retrieveCredentials,
          [OID4VCIMachineServices.addContactIdentity]: addContactIdentity,
          // [OID4VCIMachineServices.invokeAuthorizationRequest]: invokeAuthorizationRequest,
          [OID4VCIMachineServices.assertValidCredentials]: assertValidCredentials,
          [OID4VCIMachineServices.storeCredentialBranding]: storeCredentialBranding,
          [OID4VCIMachineServices.storeCredentials]: storeCredentials,
          ...opts?.services,
        },
        guards: {
          oid4vciHasNoContactGuard,
          oid4vciSelectCredentialsGuard,
          oid4vciRequirePinGuard,
          oid4vciHasNoContactIdentityGuard,
          oid4vciVerificationCodeGuard,
          oid4vciRequireAuthorizationGuard,
          oid4vciHasContactGuard,
          oid4vciCreateContactGuard,
          oid4vciHasSelectedCredentialsGuard,
          ...opts?.guards,
        },
      }),
    );

    if (typeof opts?.subscription === 'function') {
      instance.onTransition(opts.subscription);
    }
    if (opts?.requireCustomNavigationHook !== true) {
      instance.onTransition(snapshot => {
        void oid4vciStateNavigationListener(instance, snapshot);
      });
    }

    instance.subscribe(
      state => console.log('==sub=> ' + state.value),
      error => console.error('===sub==========' + error),
      () => console.log('==sub=========completed'),
    );
    instance.onTransition(state => console.log('==trans=> ' + state.value));

    return instance;
  }
}
