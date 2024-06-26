import React, {Context, createContext} from 'react';
import Debug, {Debugger} from 'debug';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {translate} from '../../localization/Localization';
import RootNavigation from './../rootNavigation';
import {APP_ID} from '../../@config/constants';
import {
  CreateContactEvent,
  SiopV2Context as SiopV2ContextType,
  SiopV2MachineEvents,
  SiopV2MachineInterpreter,
  SiopV2MachineNavigationArgs,
  SiopV2MachineState,
  SiopV2MachineStates,
  SiopV2ProviderProps,
} from '../../types/machines/siopV2';
import {MainRoutesEnum, NavigationBarRoutesEnum, PopupImagesEnum, ScreenRoutesEnum} from '../../types';
import {
  ConnectionType,
  CorrelationIdentifierType,
  CredentialRole,
  IdentityOrigin,
  NonPersistedParty,
  Party,
  PartyOrigin,
  PartyTypeType,
} from '@sphereon/ssi-sdk.data-store';
import {SimpleEventsOf} from 'xstate';
import {PresentationDefinitionWithLocation} from '@sphereon/did-auth-siop';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {Format} from '@sphereon/pex-models';
import {authenticate} from '../../services/authenticationService';

const debug: Debugger = Debug(`${APP_ID}:siopV2StateNavigation`);

const SiopV2Context: Context<SiopV2ContextType> = createContext({} as SiopV2ContextType);

const navigateLoading = async (args: SiopV2MachineNavigationArgs): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.SIOPV2, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });
};

const navigateSendingCredentials = async (args: SiopV2MachineNavigationArgs): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.SIOPV2, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_sharing_credentials_message'),
    },
  });
};

const navigateAddContact = async (args: SiopV2MachineNavigationArgs): Promise<void> => {
  const {navigation, state, siopV2Machine, onBack} = args;
  const {hasContactConsent, url, authorizationRequestData} = state.context;

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  if (url === undefined) {
    return Promise.reject(Error('Missing request data in context'));
  }

  const contactName: string = authorizationRequestData.name ?? authorizationRequestData.correlationId;
  const contact: NonPersistedParty = {
    contact: {
      displayName: contactName,
      legalName: contactName,
    },
    // FIXME maybe its nicer if we can also just use the id only
    // TODO using the predefined party type from the contact migrations here
    partyType: {
      id: '3875c12e-fdaa-4ef6-a340-c936e054b627',
      origin: PartyOrigin.EXTERNAL,
      type: PartyTypeType.ORGANIZATION,
      name: 'Sphereon_default_type',
      tenantId: '95e09cfc-c974-4174-86aa-7bf1d5251fb4',
    },
    uri: authorizationRequestData.uri && `${authorizationRequestData.uri.protocol}//${authorizationRequestData.uri.hostname}`,
    identities: [
      {
        alias: authorizationRequestData.correlationId,
        origin: IdentityOrigin.INTERNAL,
        roles: [CredentialRole.ISSUER],
        identifier: {
          type: CorrelationIdentifierType.URL,
          correlationId: authorizationRequestData.correlationId,
        },
        // TODO WAL-476 add support for correct connection
        connection: {
          type: ConnectionType.OPENID_CONNECT,
          config: {
            clientId: '138d7bf8-c930-4c6e-b928-97d3a4928b01',
            clientSecret: '03b3955f-d020-4f2a-8a27-4e452d4e27a0',
            scopes: ['auth'],
            issuer: 'https://example.com/app-test',
            redirectUrl: 'app:/callback',
            dangerouslyAllowInsecureHttpRequests: true,
            clientAuthMethod: 'post' as const,
          },
        },
      },
    ],
  };

  const onCreate = async (contact: Party): Promise<void> => {
    siopV2Machine.send({
      type: SiopV2MachineEvents.CREATE_CONTACT,
      data: contact,
    });
  };

  const onConsentChange = async (hasConsent: boolean): Promise<void> => {
    siopV2Machine.send({
      type: SiopV2MachineEvents.SET_CONTACT_CONSENT,
      data: hasConsent,
    });
  };

  const onAliasChange = async (alias: string): Promise<void> => {
    siopV2Machine.send({
      type: SiopV2MachineEvents.SET_CONTACT_ALIAS,
      data: alias,
    });
  };

  const onDecline = async (): Promise<void> => {
    siopV2Machine.send(SiopV2MachineEvents.DECLINE);
  };

  const isCreateDisabled = (): boolean => {
    return siopV2Machine.getSnapshot()?.can(SiopV2MachineEvents.CREATE_CONTACT as SimpleEventsOf<CreateContactEvent>) !== true;
  };

  navigation.navigate(MainRoutesEnum.SIOPV2, {
    screen: ScreenRoutesEnum.CONTACT_ADD,
    params: {
      name: contact.contact.displayName,
      uri: contact.uri,
      identities: contact.identities,
      hasConsent: hasContactConsent,
      onAliasChange,
      onConsentChange,
      onCreate,
      onDecline,
      onBack,
      isCreateDisabled,
    },
  });
};

const navigateSelectCredentials = async (args: SiopV2MachineNavigationArgs): Promise<void> => {
  const {navigation, state, siopV2Machine, onNext, onBack} = args;
  const {contact, authorizationRequestData} = state.context;

  if (contact === undefined) {
    return Promise.reject(Error('Missing contact in context'));
  }

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }

  if (authorizationRequestData.presentationDefinitions === undefined || authorizationRequestData.presentationDefinitions.length === 0) {
    return Promise.reject(Error('No presentation definitions present2'));
  }
  // TODO currently only supporting 1 presentation definition
  if (authorizationRequestData.presentationDefinitions.length > 1) {
    return Promise.reject(Error('Multiple presentation definitions present'));
  }
  const presentationDefinitionWithLocation: PresentationDefinitionWithLocation = authorizationRequestData.presentationDefinitions[0];
  const format: Format | undefined = authorizationRequestData.registrationMetadataPayload?.registration?.vp_formats;
  const subjectSyntaxTypesSupported: Array<string> | undefined =
    authorizationRequestData.registrationMetadataPayload?.registration?.subject_syntax_types_supported;

  const onSelect = async (selectedCredentials: Array<OriginalVerifiableCredential>): Promise<void> => {
    siopV2Machine.send({
      type: SiopV2MachineEvents.SET_SELECTED_CREDENTIALS,
      data: selectedCredentials,
    });
  };

  const isSendDisabled = (): boolean => {
    return siopV2Machine.getSnapshot()?.can(SiopV2MachineEvents.NEXT) !== true;
  };

  const onDecline = async (): Promise<void> => {
    siopV2Machine.send(SiopV2MachineEvents.DECLINE);
  };

  const onSend = async (): Promise<void> => {
    const onAuthenticate = async (): Promise<void> => {
      onNext?.();
    };
    await authenticate(onAuthenticate);
  };

  navigation.navigate(MainRoutesEnum.SIOPV2, {
    screen: ScreenRoutesEnum.CREDENTIALS_REQUIRED,
    params: {
      verifierName: contact.contact.displayName,
      presentationDefinition: presentationDefinitionWithLocation.definition,
      format,
      subjectSyntaxTypesSupported,
      onDecline,
      onSelect,
      onSend,
      onBack,
      isSendDisabled,
    },
  });
};

const navigateFinal = async (args: SiopV2MachineNavigationArgs): Promise<void> => {
  const {navigation, siopV2Machine} = args;

  debug(`Stopping siopV2 machine...`);
  siopV2Machine.stop();
  debug(`Stopped siopV2 machine`);

  navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
    screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
  });
};

const navigateError = async (args: SiopV2MachineNavigationArgs): Promise<void> => {
  const {navigation, state, onBack, onNext} = args;
  const {error} = state.context;

  if (!error) {
    return Promise.reject(Error('Missing error in context'));
  }

  navigation.navigate(MainRoutesEnum.SIOPV2, {
    screen: ScreenRoutesEnum.ERROR,
    params: {
      image: PopupImagesEnum.WARNING,
      title: error.title,
      details: error.message,
      ...(error.detailsMessage && {
        detailsPopup: {
          buttonCaption: translate('action_view_extra_details'),
          title: error.detailsTitle,
          details: error.detailsMessage,
        },
      }),
      primaryButton: {
        caption: translate('action_ok_label'),
        onPress: onNext,
      },
      onBack,
    },
  });
};

export const siopV2StateNavigationListener = async (
  siopV2Machine: SiopV2MachineInterpreter,
  state: SiopV2MachineState,
  navigation?: NativeStackNavigationProp<any>,
): Promise<void> => {
  if (state._event.type === 'internal') {
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }
  const onBack = () => siopV2Machine.send(SiopV2MachineEvents.PREVIOUS);
  const onNext = () => siopV2Machine.send(SiopV2MachineEvents.NEXT);

  const nav = navigation ?? RootNavigation;
  if (nav === undefined || !nav.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }

  if (
    state.matches(SiopV2MachineStates.createConfig) ||
    state.matches(SiopV2MachineStates.getSiopRequest) ||
    state.matches(SiopV2MachineStates.retrieveContact) ||
    state.matches(SiopV2MachineStates.transitionFromSetup)
  ) {
    return navigateLoading({siopV2Machine: siopV2Machine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(SiopV2MachineStates.sendResponse)) {
    return navigateSendingCredentials({siopV2Machine: siopV2Machine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(SiopV2MachineStates.addContact)) {
    return navigateAddContact({siopV2Machine: siopV2Machine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(SiopV2MachineStates.selectCredentials)) {
    return navigateSelectCredentials({siopV2Machine: siopV2Machine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(SiopV2MachineStates.handleError)) {
    return navigateError({siopV2Machine: siopV2Machine, state, navigation: nav, onNext, onBack});
  } else if (
    state.matches(SiopV2MachineStates.done) ||
    state.matches(SiopV2MachineStates.error) ||
    state.matches(SiopV2MachineStates.aborted) ||
    state.matches(SiopV2MachineStates.declined)
  ) {
    return navigateFinal({siopV2Machine: siopV2Machine, state, navigation: nav, onNext, onBack});
  }
};

export const SiopV2Provider = (props: SiopV2ProviderProps): JSX.Element => {
  const {children, customSiopV2Instance} = props;

  return <SiopV2Context.Provider value={{siopV2Instance: customSiopV2Instance}}>{children}</SiopV2Context.Provider>;
};
