import {VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {DidAuthConfig, Identity, Party} from '@sphereon/ssi-sdk.data-store';
import {assign, createMachine, DoneInvokeEvent, interpret} from 'xstate';
import {translate} from '../localization/Localization';
import {siopV2StateNavigationListener} from '../navigation/machines/siopV2StateNavigation';
import {addContactIdentity, createConfig, getSiopRequest, retrieveContact, sendResponse} from '../services/machines/siopV2MachineService';
import {ErrorDetails} from '../types';
import {
  ContactAliasEvent,
  ContactConsentEvent,
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

const siopV2HasNoContactGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact === undefined;
};

const siopV2HasContactGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {contact} = _ctx;
  return contact !== undefined;
};

const siopV2CreateContactGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {contactAlias, hasContactConsent} = _ctx;

  return hasContactConsent && contactAlias !== undefined && contactAlias.length > 0;
};

const siopV2HasSelectedRequiredCredentialsGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {selectedCredentials, authorizationRequestData} = _ctx;

  if (authorizationRequestData === undefined) {
    throw new Error('Missing authorization request data in context');
  }

  if (authorizationRequestData.presentationDefinitions === undefined || authorizationRequestData.presentationDefinitions.length === 0) {
    throw Error('No presentation definitions present');
  }

  // FIXME: Return true for now, given this is a really expensive operation and will be called in the next phase anyway
  return true;
  /*const definitionWithLocation: PresentationDefinitionWithLocation = authorizationRequestData.presentationDefinitions[0];
  const pex: PEX = new PEX();
  const evaluationResults: EvaluationResults = pex.evaluateCredentials(definitionWithLocation.definition, selectedCredentials);

  return evaluationResults.areRequiredCredentialsPresent === Status.INFO;*/
};

const siopV2IsSiopOnlyGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {authorizationRequestData} = _ctx;

  if (authorizationRequestData === undefined) {
    throw new Error('Missing authorization request data in context');
  }

  return authorizationRequestData.presentationDefinitions === undefined;
};

const siopV2IsSiopWithOID4VPGuard = (_ctx: SiopV2MachineContext, _event: SiopV2MachineEventTypes): boolean => {
  const {authorizationRequestData} = _ctx;

  if (!authorizationRequestData) {
    throw new Error('Missing authorization request data in context');
  }

  return authorizationRequestData.presentationDefinitions !== undefined;
};

const createSiopV2Machine = (opts: CreateSiopV2MachineOpts): SiopV2StateMachine => {
  const {url} = opts;
  const initialContext: SiopV2MachineContext = {
    url: new URL(url).toString(),
    hasContactConsent: true,
    contactAlias: '',
    selectedCredentials: [],
  };

  return createMachine<SiopV2MachineContext, SiopV2MachineEventTypes>({
    id: opts?.machineId ?? 'SIOPV2',
    predictableActionArguments: true,
    initial: SiopV2MachineStates.createConfig,
    schema: {
      events: {} as SiopV2MachineEventTypes,
      guards: {} as
        | {type: SiopV2MachineGuards.hasNoContactGuard}
        | {type: SiopV2MachineGuards.hasContactGuard}
        | {type: SiopV2MachineGuards.createContactGuard}
        | {type: SiopV2MachineGuards.hasSelectedRequiredCredentialsGuard},
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
          onDone: {
            target: SiopV2MachineStates.transitionFromSetup,
            actions: assign({contact: (_ctx: SiopV2MachineContext, _event: DoneInvokeEvent<Party>) => _event.data}),
          },
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
      [SiopV2MachineStates.transitionFromSetup]: {
        id: SiopV2MachineStates.transitionFromSetup,
        always: [
          {
            target: SiopV2MachineStates.addContact,
            cond: SiopV2MachineGuards.hasNoContactGuard,
          },
          {
            target: SiopV2MachineStates.sendResponse,
            cond: SiopV2MachineGuards.siopOnlyGuard,
          },
          {
            target: SiopV2MachineStates.selectCredentials,
            cond: SiopV2MachineGuards.siopWithOID4VPGuard,
          },
        ],
      },
      [SiopV2MachineStates.addContact]: {
        id: SiopV2MachineStates.addContact,
        initial: SiopV2MachineAddContactStates.idle,
        on: {
          [SiopV2MachineEvents.SET_CONTACT_CONSENT]: {
            actions: assign({hasContactConsent: (_ctx: SiopV2MachineContext, _event: ContactConsentEvent) => _event.data}),
          },
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
              target: `#${SiopV2MachineStates.transitionFromSetup}`,
              cond: SiopV2MachineGuards.hasContactGuard,
            },
          },
        },
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
  });
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
          ...opts?.services,
        },
        guards: {
          siopV2HasNoContactGuard,
          siopV2HasContactGuard,
          siopV2CreateContactGuard,
          siopV2HasSelectedRequiredCredentialsGuard,
          siopV2IsSiopOnlyGuard,
          siopV2IsSiopWithOID4VPGuard,
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
