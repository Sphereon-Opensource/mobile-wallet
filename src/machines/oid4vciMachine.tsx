import React from 'react';
import {assign, createMachine, DoneInvokeEvent, interpret, send} from 'xstate';
import Debug, {Debugger} from 'debug';
import {IContact} from '@sphereon/ssi-sdk.data-store';
import OpenId4VcIssuanceProvider from '../providers/credential/OpenId4VcIssuanceProvider';
import {
  addContactIdentity,
  createCredentialSelection,
  initiating,
  retrieveContact,
  retrieveCredentials,
  storeCredentialBranding,
  storeCredentials,
  verifyCredentials,
} from '../services/machines/oid4vciMachineService';
import {oid4vciStateNavigationListener} from '../navigation/machines/oid4vciStateNavigation';
import {APP_ID} from '../@config/constants';
import {
  ContactAliasEvent,
  ContactConsentEvent,
  CreateContactEvent,
  CreateOID4VCIMachineOpts,
  MappedCredentialOffer,
  OID4VCIContext,
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

const debug: Debugger = Debug(`${APP_ID}:oid4vciMachine`);

const oid4vciHasNotContactGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact === undefined;
};

const oid4vciHasContactGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact !== undefined;
};

const oid4vciSelectCredentialsGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {supportedCredentials} = _ctx;
  return supportedCredentials.length > 1;
};

const oid4vciAuthenticationGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {requestData} = _ctx;
  return requestData?.credentialOffer.userPinRequired === true;
};

const oid4vciHasNotContactIdentityGuard = (_ctx: OID4VCIMachineContext, _event: OID4VCIMachineEventTypes): boolean => {
  const {contact, credentialOffers} = _ctx;
  // TODO any / types
  return !contact!.identities!.some((identity: any): boolean => identity.identifier.correlationId === credentialOffers[0].correlationId);
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

// TODO rename as onboarding
const createOID4VCIMachine = (opts?: CreateOID4VCIMachineOpts): OID4VCIStateMachine => {
  // const {requestData} = opts ?? {};

  // // TODO this needs to be improved
  // if (!requestData) {
  //   throw new Error('Unable to create OID4VCI machine. Missing request data');
  // }

  // const initialContext: OID4VCIMachineContext = {
  //   // TODO we need to store the data from OpenIdProvider here in the context and make sure we can restart the machine with it and init the OpenIdProvider
  //   requestData,
  //   supportedCredentials: [],
  //   selectedCredentials: [],
  //   credentialOffers: [],
  //   hasContactConsent: true,
  //   contactAlias: '',
  // };

  return createMachine<OID4VCIMachineContext, OID4VCIMachineEventTypes>({
    id: opts?.machineId ?? 'OID4VCI',
    predictableActionArguments: true,
    initial: OID4VCIMachineStates.initiating,
    schema: {
      events: {} as OID4VCIMachineEventTypes,
      guards: {} as
        | {type: OID4VCIMachineGuards.hasNotContactGuard}
        | {type: OID4VCIMachineGuards.selectCredentialsGuard}
        | {type: OID4VCIMachineGuards.authenticationGuard}
        | {type: OID4VCIMachineGuards.contactHasNotIdentityGuard}
        | {type: OID4VCIMachineGuards.verificationCodeGuard}
        | {type: OID4VCIMachineGuards.hasContactGuard}
        | {type: OID4VCIMachineGuards.createContactGuard}
        | {type: OID4VCIMachineGuards.hasSelectedCredentialsGuard},
      services: {} as {
        [OID4VCIMachineServices.initiating]: {
          data: OpenId4VcIssuanceProvider;
        };
        [OID4VCIMachineServices.createCredentialSelection]: {
          data: Array<ICredentialTypeSelection>;
        };
        [OID4VCIMachineServices.retrieveContact]: {
          data: IContact | undefined;
        };
        [OID4VCIMachineServices.retrieveCredentials]: {
          data: Array<MappedCredentialOffer> | undefined;
        };
        [OID4VCIMachineServices.addContactIdentity]: {
          data: void;
        };
        [OID4VCIMachineServices.verifyCredentials]: {
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
    // context: {
    //   // ...initialContext,
    // } as OID4VCIMachineContext,
    states: {
      [OID4VCIMachineStates.initiating]: {
        id: OID4VCIMachineStates.initiating,
        invoke: {
          src: OID4VCIMachineServices.initiating,
          onDone: {
            target: OID4VCIMachineStates.creatingCredentialSelection,
            actions: assign({openId4VcIssuanceProvider: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<any>) => _event.data}),
          },
          onError: {
            target: OID4VCIMachineStates.showingError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: 'Initiation', // TODO translate
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.creatingCredentialSelection]: {
        id: OID4VCIMachineStates.creatingCredentialSelection,
        invoke: {
          src: OID4VCIMachineServices.createCredentialSelection,
          onDone: {
            target: OID4VCIMachineStates.retrievingContact,
            actions: assign({supportedCredentials: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<any>) => _event.data}),
            // TODO add condition that we have at least 1 vc in the selection
          },
          onError: {
            target: OID4VCIMachineStates.showingError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: 'Credential selection', // TODO translate
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.retrievingContact]: {
        id: OID4VCIMachineStates.retrievingContact,
        invoke: {
          src: OID4VCIMachineServices.retrieveContact,
          onDone: {
            target: OID4VCIMachineStates.transitioningFromSetup,
            actions: assign({contact: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<any>) => _event.data}), // TODO any and all others
          },
          onError: {
            target: OID4VCIMachineStates.showingError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: 'retrieve contact', // TODO translate
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.transitioningFromSetup]: {
        id: OID4VCIMachineStates.transitioningFromSetup,
        always: [
          {
            target: OID4VCIMachineStates.addingContact,
            cond: OID4VCIMachineGuards.hasNotContactGuard,
          },
          {
            target: OID4VCIMachineStates.selectingCredentials,
            cond: OID4VCIMachineGuards.selectCredentialsGuard,
          },
          {
            target: OID4VCIMachineStates.authenticating,
            cond: OID4VCIMachineGuards.authenticationGuard,
          },
          {
            target: OID4VCIMachineStates.retrievingCredentials,
          },
        ],
      },
      [OID4VCIMachineStates.addingContact]: {
        id: OID4VCIMachineStates.addingContact,
        on: {
          [OID4VCIMachineEvents.SET_CONTACT_CONSENT]: {
            actions: assign({hasContactConsent: (_ctx: OID4VCIMachineContext, _event: ContactConsentEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.SET_CONTACT_ALIAS]: {
            actions: assign({contactAlias: (_ctx: OID4VCIMachineContext, _event: ContactAliasEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.CREATE_CONTACT]: {
            cond: OID4VCIMachineGuards.createContactGuard,
            actions: [assign({contact: (_ctx: OID4VCIMachineContext, _event: CreateContactEvent) => _event.data}), send(OID4VCIMachineEvents.NEXT)],
          },
          [OID4VCIMachineEvents.DECLINE]: {
            target: OID4VCIMachineStates.declined,
          },
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.aborted,
          },
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.transitioningFromContactSetup,
            cond: OID4VCIMachineGuards.hasContactGuard,
          },
        },
      },
      [OID4VCIMachineStates.transitioningFromContactSetup]: {
        id: OID4VCIMachineStates.transitioningFromContactSetup,
        always: [
          {
            target: OID4VCIMachineStates.selectingCredentials,
            cond: OID4VCIMachineGuards.selectCredentialsGuard,
          },
          {
            target: OID4VCIMachineStates.authenticating,
            cond: OID4VCIMachineGuards.authenticationGuard,
          },
          {
            target: OID4VCIMachineStates.retrievingCredentials,
          },
        ],
      },
      [OID4VCIMachineStates.selectingCredentials]: {
        id: OID4VCIMachineStates.selectingCredentials,
        on: {
          [OID4VCIMachineEvents.SET_SELECTED_CREDENTIALS]: {
            actions: assign({selectedCredentials: (_ctx: OID4VCIMachineContext, _event: SelectCredentialsEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.transitioningFromSelectingCredentials,
            cond: OID4VCIMachineGuards.hasSelectedCredentialsGuard,
          },
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.aborted,
          },
        },
      },
      [OID4VCIMachineStates.transitioningFromSelectingCredentials]: {
        id: OID4VCIMachineStates.transitioningFromSelectingCredentials,
        always: [
          {
            target: OID4VCIMachineStates.authenticating,
            cond: OID4VCIMachineGuards.authenticationGuard,
          },
          {
            target: OID4VCIMachineStates.retrievingCredentials,
          },
        ],
      },
      [OID4VCIMachineStates.authenticating]: {
        id: OID4VCIMachineStates.authenticating,
        on: {
          [OID4VCIMachineEvents.SET_VERIFICATION_CODE]: {
            actions: assign({verificationCode: (_ctx: OID4VCIMachineContext, _event: VerificationCodeEvent) => _event.data}),
          },
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.retrievingCredentials,
            cond: OID4VCIMachineGuards.verificationCodeGuard,
          },
          [OID4VCIMachineEvents.PREVIOUS]: [
            {
              target: OID4VCIMachineStates.selectingCredentials,
              cond: OID4VCIMachineGuards.selectCredentialsGuard,
            },
            {
              target: OID4VCIMachineStates.aborted,
            },
          ],
        },
      },
      [OID4VCIMachineStates.retrievingCredentials]: {
        id: OID4VCIMachineStates.retrievingCredentials,
        invoke: {
          src: OID4VCIMachineServices.retrieveCredentials,
          onDone: {
            target: OID4VCIMachineStates.verifyingCredentials,
            actions: assign({credentialOffers: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<any>) => _event.data}),
          },
          onError: {
            target: OID4VCIMachineStates.showingError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: 'retrieve credentials', // TODO translate
                message: _event.data.message,
              }),
            }),
          },
        },
        exit: assign({verificationCode: undefined}),
      },
      [OID4VCIMachineStates.verifyingCredentials]: {
        id: OID4VCIMachineStates.verifyingCredentials,
        invoke: {
          src: OID4VCIMachineServices.verifyCredentials,
          onDone: {
            target: OID4VCIMachineStates.transitioningFromWalletInput,
          },
          onError: {
            target: OID4VCIMachineStates.showingError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: 'verify credentials', // TODO translate
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.transitioningFromWalletInput]: {
        id: OID4VCIMachineStates.transitioningFromWalletInput,
        always: [
          {
            target: OID4VCIMachineStates.addingContactIdentity,
            cond: OID4VCIMachineGuards.contactHasNotIdentityGuard,
          },
          {
            target: OID4VCIMachineStates.reviewingCredentialOffers,
          },
        ],
      },
      [OID4VCIMachineStates.addingContactIdentity]: {
        id: OID4VCIMachineStates.addingContactIdentity,
        invoke: {
          src: OID4VCIMachineServices.addContactIdentity,
          onDone: {
            target: OID4VCIMachineStates.reviewingCredentialOffers,
          },
          onError: {
            target: OID4VCIMachineStates.showingError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: 'adding contact identity', // TODO translate
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.reviewingCredentialOffers]: {
        id: OID4VCIMachineStates.reviewingCredentialOffers,
        on: {
          [OID4VCIMachineEvents.NEXT]: {
            target: OID4VCIMachineStates.storingCredentialBranding,
          },
          [OID4VCIMachineEvents.DECLINE]: {
            target: OID4VCIMachineStates.declined,
          },
          [OID4VCIMachineEvents.PREVIOUS]: {
            target: OID4VCIMachineStates.aborted,
          },
        },
      },
      [OID4VCIMachineStates.storingCredentialBranding]: {
        id: OID4VCIMachineStates.storingCredentialBranding,
        invoke: {
          src: OID4VCIMachineServices.storeCredentialBranding,
          onDone: {
            target: OID4VCIMachineStates.storingCredentials,
          },
          onError: {
            target: OID4VCIMachineStates.showingError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: 'storing credential branding', // TODO translate
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.storingCredentials]: {
        id: OID4VCIMachineStates.storingCredentials,
        invoke: {
          src: OID4VCIMachineServices.storeCredentials,
          onDone: {
            target: OID4VCIMachineStates.done,
          },
          onError: {
            target: OID4VCIMachineStates.showingError,
            actions: assign({
              error: (_ctx: OID4VCIMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
                title: 'store credential', // TODO translate
                message: _event.data.message,
              }),
            }),
          },
        },
      },
      [OID4VCIMachineStates.showingError]: {
        id: OID4VCIMachineStates.showingError,
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
  private static getContext = (context?: OID4VCIMachineContext) => {
    return {
      requestData: context?.requestData,
      supportedCredentials: context?.supportedCredentials ?? [],
      contactAlias: context?.contactAlias ?? '',
      selectedCredentials: context?.selectedCredentials ?? [],
      credentialOffers: context?.credentialOffers ?? [],
      hasContactConsent: context?.hasContactConsent ?? false,
      openId4VcIssuanceProvider: context?.openId4VcIssuanceProvider,
      contact: context?.contact,
      verificationCode: context?.verificationCode,
      error: context?.error,
    };
  };

  static newInstance(opts?: OID4VCIMachineInstanceOpts): OID4VCIMachineInterpreter {
    const machine: OID4VCIStateMachine = createOID4VCIMachine(opts);

    const instance: OID4VCIMachineInterpreter = interpret(
      machine
        .withConfig({
          services: {
            [OID4VCIMachineServices.initiating]: initiating,
            [OID4VCIMachineServices.createCredentialSelection]: createCredentialSelection,
            [OID4VCIMachineServices.retrieveContact]: retrieveContact,
            [OID4VCIMachineServices.retrieveCredentials]: retrieveCredentials,
            [OID4VCIMachineServices.addContactIdentity]: addContactIdentity,
            [OID4VCIMachineServices.verifyCredentials]: verifyCredentials,
            [OID4VCIMachineServices.storeCredentialBranding]: storeCredentialBranding,
            [OID4VCIMachineServices.storeCredentials]: storeCredentials,
            ...opts?.services,
          },
          guards: {
            oid4vciHasNotContactGuard,
            oid4vciSelectCredentialsGuard,
            oid4vciAuthenticationGuard,
            oid4vciHasNotContactIdentityGuard,
            oid4vciVerificationCodeGuard,
            oid4vciHasContactGuard,
            oid4vciCreateContactGuard,
            oid4vciHasSelectedCredentialsGuard,
            ...opts?.guards,
          },
        })
        .withContext(
          () => OID4VCIMachine.getContext(opts?.context),
          // {
          //   // todo use provided context
          //   // if (opts?.context) {
          //   //   return opts?.context
          //   // }
          //
          //   return OID4VCIMachine.getContext(opts?.context)
          //
          //   // todo get initial context
          //   // return {
          //   //   requestData: opts?.context.requestData,
          //   //   supportedCredentials: opts?.context.supportedCredentials ?? [],
          //   //   contactAlias: opts?.context.contactAlias ?? '',
          //   //   selectedCredentials: opts?.context.selectedCredentials ?? [],
          //   //   credentialOffers: opts?.context.credentialOffers ?? [],
          //   //   hasContactConsent: opts?.context.hasContactConsent ?? false,
          //   //   openId4VcIssuanceProvider: opts?.context.openId4VcIssuanceProvider,
          //   //   contact: opts?.context.contact,
          //   //   verificationCode: opts?.context.verificationCode,
          //   //   error: opts?.context.error
          //   // }
          // }
        ),
    );

    // if (opts?.context) {
    //   machine.withContext(opts?.context)
    // }

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
