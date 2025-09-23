import VciServiceFunkeCProvider from '../../providers/authentication/funke/VciServiceFunkeCProvider';
import {
  CreateContactEvent,
  FunkeC2ShareContextType,
  FunkeC2ShareMachineContext,
  FunkeC2ShareMachineEvents,
  FunkeC2ShareMachineInterpreter,
  FunkeC2ShareMachineState,
  FunkeC2ShareMachineStateTypes,
  FunkeC2ShareProviderProps,
} from '../../types/machines/funkeC2ShareMachine';
import React, {Context, createContext} from 'react';
import RootNavigation from '../rootNavigation';
import Debug, {Debugger} from 'debug';
import {APP_ID} from '../../@config/constants';
import {MainRoutesEnum, NavigationBarRoutesEnum, PopupImagesEnum, ScreenRoutesEnum} from '../../types';
import {translate} from '../../localization/Localization';
import {FunkeC2ShareMachine} from '../../machines/funkeC2ShareMachine';
import {delay, lookupFederationParties} from '../../utils';
import {GetPIDCredentialsMachineEvents} from '../../types/machines/getPIDCredentialMachine';
import {CredentialRole} from '@sphereon/ssi-types';
import {
  ConnectionType,
  CorrelationIdentifierType,
  IdentityOrigin,
  NonPersistedParty,
  Party,
  PartyOrigin,
  PartyTypeType,
} from '@sphereon/ssi-sdk.data-store';
import {SimpleEventsOf} from 'xstate';
import {SiopV2MachineEvents} from '../../types/machines/siopV2';

const debug: Debugger = Debug(`${APP_ID}:funkeC2ShareStateNavigation`);

export const FunkeC2ShareContext: Context<FunkeC2ShareContextType> = createContext({} as FunkeC2ShareContextType);

const navigateLoading = async (args: any): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });
};

const navigateAddContact = async (args: any): Promise<void> => {
  const {navigation, context, machine} = args;
  const {url, authorizationRequestData, trustedAnchors} = context;

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
    machine.send({
      type: FunkeC2ShareMachineEvents.CREATE_CONTACT,
      data: contact,
    });
  };

  const onAliasChange = async (alias: string): Promise<void> => {
    machine.send({
      type: FunkeC2ShareMachineEvents.SET_CONTACT_ALIAS,
      data: alias,
    });
  };

  const onDecline = async (): Promise<void> => {
    machine.send(FunkeC2ShareMachineEvents.DECLINE);
  };

  const isCreateDisabled = (): boolean => {
    return machine.getSnapshot()?.can(FunkeC2ShareMachineEvents.CREATE_CONTACT as SimpleEventsOf<CreateContactEvent>) !== true;
  };

  const federationParties = await lookupFederationParties(contact, trustedAnchors);

  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: ScreenRoutesEnum.NEW_CONTACT_ADD,
    params: {
      name: contact.contact.displayName,
      roles: [CredentialRole.VERIFIER],
      uri: contact.uri,
      federations: federationParties,
      identities: contact.identities,
      onAliasChange,
      onCreate,
      onDecline,
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      isCreateDisabled,
    },
  });
};

const navigateReviewContact = async (args: any): Promise<void> => {
  const {navigation, context, machine} = args;
  const {contact, trustedAnchors } = context;

  if (!contact) {
    return Promise.reject(Error('Missing contact in context'));
  }

  const onDecline = async (): Promise<void> => {
    machine.send(SiopV2MachineEvents.DECLINE);
  };

  const federationParties = await lookupFederationParties(contact, trustedAnchors);
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: ScreenRoutesEnum.NEW_CONTACT_ADD,
    params: {
      name: contact.contact.displayName,
      roles: contact.roles,
      uri: contact.uri,
      federations: federationParties,
      onContinue: async () => machine.send(FunkeC2ShareMachineEvents.NEXT),
      onDecline,
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
    },
  });
};

const navigateAcceptRequestInformation = async (args: any): Promise<void> => {
  const {navigation, machine} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: 'ImportDataConsent',
    params: {
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      onAccept: async () => machine.send(FunkeC2ShareMachineEvents.NEXT),
      onDecline: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
    },
  });
};

const navigateAuthenticateAusweisEID = async (args: any): Promise<void> => {
  const {navigation, machine} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: 'ImportPersonalData',
    params: {
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      onAuth: async (provider: VciServiceFunkeCProvider) => {
        machine.send(FunkeC2ShareMachineEvents.SET_FUNKE_PROVIDER, {data: provider});
        // Adding a small delay to let the animation play
        await delay(600);
        machine.send(FunkeC2ShareMachineEvents.NEXT);
      },
    },
  });
};

const navigateAuthenticate = async (args: any): Promise<void> => {
  const {navigation, machine} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: 'ImportDataAuthentication',
    params: {
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      onAccept: async () => machine.send(FunkeC2ShareMachineEvents.NEXT),
    },
  });
};

const navigateAcceptShareCredential = async (args: any): Promise<void> => {
  const {navigation, machine, context} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: 'ImportDataFinal',
    params: {
      onBack: async () => machine.send(FunkeC2ShareMachineEvents.PREVIOUS),
      onAccept: async () => machine.send(FunkeC2ShareMachineEvents.NEXT),
      onDecline: async () => machine.send(FunkeC2ShareMachineEvents.DECLINE),
      credentials: context.pidCredentials,
      isShareFlow: true,
    },
  });
};

const navigateSendingCredentials = async (args: any): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.FUNKE_C2_SHARE, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_sharing_credentials_message'),
    },
  });
};

const navigateHandleError = async (args: any): Promise<void> => {
  const {navigation, machine, context} = args;

  if (!context.error) {
    throw new Error(`Missing error in context`);
  }

  navigation.navigate(ScreenRoutesEnum.ERROR, {
    image: PopupImagesEnum.WARNING,
    title: context.error.title,
    details: context.error.message,
    ...(context.error.detailsMessage && {
      detailsPopup: {
        buttonCaption: translate('action_view_extra_details'),
        title: context.error.detailsTitle,
        details: context.error.detailsMessage,
      },
    }),
    primaryButton: {
      caption: translate('action_ok_label'),
      accessibilityLabel: `${translate('action_ok_label')}. Exit flow`,
      onPress: () => machine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
    },
    onBack: () => machine.send(GetPIDCredentialsMachineEvents.PREVIOUS),
  });
};

const navigateFinal = async (args: any): Promise<void> => {
  const {navigation} = args;
  FunkeC2ShareMachine.clearInstance({stop: true});
  navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
    screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
  });
};

export const funkeC2ShareStateNavigationListener = (funkeCShareMachine: FunkeC2ShareMachineInterpreter, state: FunkeC2ShareMachineState): void => {
  if (state._event.type === 'internal') {
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }
  const context: FunkeC2ShareMachineContext = funkeCShareMachine.getSnapshot().context;
  const navigation = RootNavigation;
  if (navigation === undefined || !navigation.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }

  // FIXME quick hack to stop the navigation from resetting as the ImportPersonalDataScreen uses params to set new header text
  if (state._event.name === 'SET_FUNKE_PROVIDER') {
    return;
  }

  if (
    state.matches(FunkeC2ShareMachineStateTypes.createConfig) ||
    state.matches(FunkeC2ShareMachineStateTypes.getSiopRequest) ||
    state.matches(FunkeC2ShareMachineStateTypes.retrieveContact) ||
    state.matches(FunkeC2ShareMachineStateTypes.getFederationTrust) ||
    state.matches(FunkeC2ShareMachineStateTypes.retrievePIDCredentials)
  ) {
    void navigateLoading({navigation, context, machine: funkeCShareMachine});
  } else if (
    state.matches(FunkeC2ShareMachineStateTypes.sendResponse) ||
    state.matches(FunkeC2ShareMachineStateTypes.storePIDCredentials) ||
    state.matches(FunkeC2ShareMachineStateTypes.storeCredentialBranding) ||
    state.matches(FunkeC2ShareMachineStateTypes.fetchCredentialsInStore)
  ) {
    void navigateSendingCredentials({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.addContact)) {
    void navigateAddContact({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.reviewContact)) {
    void navigateReviewContact({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.acceptRequestInformation)) {
    void navigateAcceptRequestInformation({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.authenticateAusweisEID)) {
    void navigateAuthenticateAusweisEID({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.authenticate)) {
    void navigateAuthenticate({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.acceptShareCredential)) {
    void navigateAcceptShareCredential({navigation, context, machine: funkeCShareMachine});
  } else if (state.matches(FunkeC2ShareMachineStateTypes.handleError)) {
    void navigateHandleError({navigation, context, machine: funkeCShareMachine});
  } else if (
    state.matches(FunkeC2ShareMachineStateTypes.done) ||
    state.matches(FunkeC2ShareMachineStateTypes.error) ||
    state.matches(FunkeC2ShareMachineStateTypes.aborted) ||
    state.matches(FunkeC2ShareMachineStateTypes.declined)
  ) {
    void navigateFinal({navigation});
  }
};

export const FunkeC2ShareProvider = (props: FunkeC2ShareProviderProps): JSX.Element => {
  const {children, customFunkeC2ShareInstance} = props;

  return <FunkeC2ShareContext.Provider value={{funkeC2ShareInstance: customFunkeC2ShareInstance}}>{children}</FunkeC2ShareContext.Provider>;
};

