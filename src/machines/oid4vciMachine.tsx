import React from 'react';
import {assign, createMachine, DoneInvokeEvent, interpret, send} from 'xstate';
import {IContact, IIdentity} from '@sphereon/ssi-sdk.data-store';
import OpenId4VcIssuanceProvider from '../providers/credential/OpenId4VcIssuanceProvider';
import {
  addContactIdentity,
  createCredentialSelection,
  initiateOpenId4VcIssuanceProvider,
  retrieveContact,
  retrieveCredentialOffers,
  storeCredentialBranding,
  storeCredentials,
  assertValidCredentials,
} from '../services/machines/oid4vciMachineService';
import {oid4vciStateNavigationListener} from '../navigation/machines/oid4vciStateNavigation';
import {
  ContactAliasEvent,
  ContactConsentEvent,
  CreateContactEvent,
  CreateOID4VCIMachineOpts,
  MappedCredentialOffer,
  OID4VCIMachineContext,
  OID4VCIMachineEvents,
  OID4VCIMachineEventTypes,
  OID4VCIMachineGuards,
  OID4VCIMachineInstanceOpts,
  OID4VCIMachineInterpreter,
  OID4VCIMachineServices,
  OID4VCIMachineState,
  OID4VCIMachineStates,
  OID4VCIStateMachine,
  SelectCredentialsEvent,
  VerificationCodeEvent,
} from '../types/machines/oid4vci';
import {ErrorDetails, ICredentialTypeSelection} from '../types';
import {translate} from '../localization/Localization';

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
  return requestData?.credentialOffer.userPinRequired === true;
};

const oid4vciHasNoContactIdentityGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {contact, credentialOffers} = _ctx;
  return !contact?.identities!.some((identity: IIdentity): boolean => identity.identifier.correlationId === credentialOffers[0].correlationId);
};

const oid4vciVerificationCodeGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {verificationCode} = _ctx;
  return verificationCode !== undefined && verificationCode.length > 0;
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
    // TODO we need to store the data from OpenIdProvider here in the context and make sure we can restart the machine with it and init the OpenIdProvider
    requestData: opts?.requestData,
    credentialSelection: [],
    selectedCredentials: [],
    credentialOffers: [],
    hasContactConsent: true,
    contactAlias: '',
  };

  return createMachine<OID4VCIMachineContext, OID4VCIMachineEventTypes>({
    id: opts?.machineId ?? 'OID4VCI',
    predictableActionArguments: true,
    initial: OID4VCIMachineStates.initiate,
    schema: {
      events: {} as OID4VCIMachineEventTypes,
      guards: {} as
        | {type: OID4VCIMachineGuards.hasNotContactGuard}
        | {type: OID4VCIMachineGuards.selectCredentialGuard}
        | {type: OID4VCIMachineGuards.requirePinGuard}
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
          data: IContact | undefined;
        };
        [OID4VCIMachineServices.retrieveCredentialOffers]: {
          data: Array<MappedCredentialOffer> | undefined;
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
      [OID4VCIMachineStates.initiate]: {
        id: OID4VCIMachineStates.initiate,
        invoke: {
          src: OID4VCIMachineServices.initiate,
          onDone: {
            target: OID4VCIMachineStates.createCredentialSelection,
            actions: assign({
              openId4VcIssuanceProvider: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<OpenId4VcIssuanceProvider>) => _event.data,
            }),
          },
          onError: {
            target: OID4VCIMachineStates.showError,
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
            // TODO would be nice if we can have guard that checks if we have at least 1 item in the selection. not sure if this can occur but it would be more defensive.
            // Still cannot find a nice way to do this inside of an invoke besides adding another transition state
          },
          onError: {
            target: OID4VCIMachineStates.showError,
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
            actions: assign({contact: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<IContact>) => _event.data}),
          },
          onError: {
            target: OID4VCIMachineStates.showError,
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
            cond: OID4VCIMachineGuards.hasNotContactGuard,
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
            target: OID4VCIMachineStates.retrieveCredentialsOffers,
          },
        ],
      },
      [OID4VCIMachineStates.addContact]: {
        id: OID4VCIMachineStates.addContact,
        on: {
          [OID4VCIMachineEvents.SET_CONTACT_CONSENT]: {
            actions: assign({hasContactConsent: (_ctx: OID4VCIMachineContext, _event: ContactConsentEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.SET_CONTACT_ALIAS]: {
            actions: assign({contactAlias: (_ctx: OID4VCIMachineContext, _event: ContactAliasEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.CREATE_CONTACT]: {
            cond: OID4VCIMachineGuards.createContactGuard,
            // TODO we need a better approach of assigning a value and using guards to check the value
            actions: [assign({contact: (_ctx: OID4VCIMachineContext, _event: CreateContactEvent) => _event.data}), send(OID4VCIMachineEvents.NEXT)],
          },
          [OID4VCIMachineEvents.DECLINE]: {
            target: OID4VCIMachineStates.declined,
          },
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.aborted,
          },
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.transitionFromContactSetup,
            cond: OID4VCIMachineGuards.hasContactGuard,
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
            target: OID4VCIMachineStates.retrieveCredentialsOffers,
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
            target: OID4VCIMachineStates.retrieveCredentialsOffers,
          },
        ],
      },
      [OID4VCIMachineStates.verifyPin]: {
        id: OID4VCIMachineStates.verifyPin,
        on: {
          [OID4VCIMachineEvents.SET_VERIFICATION_CODE]: {
            actions: assign({verificationCode: (_ctx: OID4VCIMachineContext, _event: VerificationCodeEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.retrieveCredentialsOffers,
            cond: OID4VCIMachineGuards.verificationCodeGuard,
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
      },
      [OID4VCIMachineStates.retrieveCredentialsOffers]: {
        id: OID4VCIMachineStates.retrieveCredentialsOffers,
        invoke: {
          src: OID4VCIMachineServices.retrieveCredentialOffers,
          onDone: {
            target: OID4VCIMachineStates.verifyCredentials,
            actions: assign({credentialOffers: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Array<MappedCredentialOffer>>) => _event.data}),
          },
          onError: {
            target: OID4VCIMachineStates.showError,
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
            target: OID4VCIMachineStates.showError,
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
            actions: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<IIdentity>): void => {
              _ctx.contact?.identities.push(_event.data);
            },
          },
          onError: {
            target: OID4VCIMachineStates.showError,
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
            target: OID4VCIMachineStates.showError,
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
            target: OID4VCIMachineStates.showError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: translate('oid4vci_machine_store_credential_error_title'),
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.showError]: {
        id: OID4VCIMachineStates.showError,
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
          [OID4VCIMachineServices.retrieveCredentialOffers]: retrieveCredentialOffers,
          [OID4VCIMachineServices.addContactIdentity]: addContactIdentity,
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
          oid4vciHasContactGuard,
          oid4vciCreateContactGuard,
          oid4vciHasSelectedCredentialsGuard,
          ...opts?.guards,
        },
      }),
    );

    if (typeof opts?.subscription === 'function') {
      instance.onTransition(opts.subscription);
    } else if (opts?.requireCustomNavigationHook !== true) {
      instance.onTransition((snapshot: OID4VCIMachineState): void => {
        void oid4vciStateNavigationListener(instance, snapshot);
      });
    }

    return instance;
  }
}
