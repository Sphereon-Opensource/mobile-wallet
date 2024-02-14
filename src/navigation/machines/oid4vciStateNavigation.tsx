import {getIssuerName, getSupportedCredential} from '@sphereon/oid4vci-common';
import React, {Context, createContext} from 'react';
import {Linking} from 'react-native';
import {URL} from 'react-native-url-polyfill';
import {SimpleEventsOf} from 'xstate';
import Debug, {Debugger} from 'debug';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  ConnectionTypeEnum,
  CorrelationIdentifierEnum,
  IBasicCredentialLocaleBranding,
  IdentityRoleEnum,
  NonPersistedParty,
  Party,
  PartyTypeEnum,
} from '@sphereon/ssi-sdk.data-store';
import OpenId4VcIssuanceProvider from '../../providers/credential/OpenId4VcIssuanceProvider';
import {toNonPersistedCredentialSummary} from '../../utils/mappers/credential/CredentialMapper';
import {translate} from '../../localization/Localization';
import RootNavigation from './../rootNavigation';
import {APP_ID} from '../../@config/constants';
import {
  CreateContactEvent,
  OID4VCIContext as OID4VCIContextType,
  OID4VCIMachineEvents,
  OID4VCIMachineInterpreter,
  OID4VCIMachineNavigationArgs,
  OID4VCIMachineState,
  OID4VCIMachineStates,
  OID4VCIProviderProps,
} from '../../types/machines/oid4vci';
import {MainRoutesEnum, NavigationBarRoutesEnum, PopupImagesEnum, ScreenRoutesEnum} from '../../types';

const debug: Debugger = Debug(`${APP_ID}:oid4vciStateNavigation`);

const OID4VCIContext: Context<OID4VCIContextType> = createContext({} as OID4VCIContextType);

const navigateLoading = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });
};

const navigateAddContact = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onBack} = args;
  const {openId4VcIssuanceProvider, hasContactConsent} = state.context;

  if (!openId4VcIssuanceProvider) {
    return Promise.reject(Error('Missing OpenId4VcIssuanceProvider in context'));
  }

  if (!openId4VcIssuanceProvider.serverMetadata) {
    return Promise.reject(Error('OID4VCI issuance provider has no server metadata'));
  }

  const issuerUrl: URL = new URL(openId4VcIssuanceProvider.serverMetadata.issuer);
  const correlationId: string = `${issuerUrl.protocol}//${issuerUrl.hostname}`;
  const issuerName: string = getIssuerName(correlationId, openId4VcIssuanceProvider.serverMetadata.credentialIssuerMetadata);

  const contact: NonPersistedParty = {
    contact: {
      displayName: issuerName,
      legalName: issuerName,
    },
    // FIXME maybe its nicer if we can also just use the id only
    // TODO using the predefined party type from the contact migrations here
    partyType: {
      id: '3875c12e-fdaa-4ef6-a340-c936e054b627',
      type: PartyTypeEnum.ORGANIZATION,
      name: 'Sphereon_default_type',
      tenantId: '95e09cfc-c974-4174-86aa-7bf1d5251fb4',
    },
    uri: correlationId,
    identities: [
      {
        alias: correlationId,
        roles: [IdentityRoleEnum.ISSUER],
        identifier: {
          type: CorrelationIdentifierEnum.URL,
          correlationId: issuerUrl.hostname,
        },
        // TODO WAL-476 add support for correct connection
        connection: {
          type: ConnectionTypeEnum.OPENID_CONNECT,
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
    oid4vciMachine.send({
      type: OID4VCIMachineEvents.CREATE_CONTACT,
      data: contact,
    });
  };

  const onConsentChange = async (hasConsent: boolean): Promise<void> => {
    oid4vciMachine.send({
      type: OID4VCIMachineEvents.SET_CONTACT_CONSENT,
      data: hasConsent,
    });
  };

  const onAliasChange = async (alias: string): Promise<void> => {
    oid4vciMachine.send({
      type: OID4VCIMachineEvents.SET_CONTACT_ALIAS,
      data: alias,
    });
  };

  const onDecline = async (): Promise<void> => {
    oid4vciMachine.send(OID4VCIMachineEvents.DECLINE);
  };

  const isCreateDisabled = (): boolean => {
    return oid4vciMachine.getSnapshot()?.can(OID4VCIMachineEvents.CREATE_CONTACT as SimpleEventsOf<CreateContactEvent>) !== true;
  };

  navigation.navigate(MainRoutesEnum.OID4VCI, {
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

const navigateSelectCredentials = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onNext, onBack} = args;
  const {contact, credentialSelection} = state.context;

  if (!contact) {
    return Promise.reject(Error('Missing contact in context'));
  }

  const onSelectType = async (selectedCredentials: Array<string>): Promise<void> => {
    const provider = state.context.openId4VcIssuanceProvider;
    if (!provider) {
      throw Error(`No provider present in context`);
    }
    oid4vciMachine.send({
      type: OID4VCIMachineEvents.SET_SELECTED_CREDENTIALS,
      data: selectedCredentials,
    });
  };

  const isSelectDisabled = (): boolean => {
    return oid4vciMachine.getSnapshot()?.can(OID4VCIMachineEvents.NEXT) !== true;
  };

  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE,
    params: {
      issuer: contact.contact.displayName,
      credentialTypes: credentialSelection,
      onSelectType,
      onSelect: onNext,
      onBack,
      isSelectDisabled,
    },
  });
};

const navigatePINVerification = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onBack} = args;
  const {selectedCredentials} = state.context;
  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.VERIFICATION_CODE,
    params: {
      credentialName: selectedCredentials[0],
      credentialTypes: [],
      onVerification: async (pin: string): Promise<void> => {
        oid4vciMachine.send({
          type: OID4VCIMachineEvents.SET_VERIFICATION_CODE,
          data: pin,
        });
      },
      onBack,
    },
  });
};

const navigateAuthorizationCodeURL = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onBack} = args;
  const url = state.context.authorizationCodeURL;
  debug('navigateAuthorizationCodeURL: ', url);
  if (!url) {
    return Promise.reject(Error('Missing authorization URL in context'));
  }
  const onOpenAuthorizationUrl = async (url: string): Promise<void> => {
    debug('onOpenAuthorizationUrl being invoked: ', url);
    oid4vciMachine.send({
      type: OID4VCIMachineEvents.INVOKED_AUTHORIZATION_CODE_REQUEST,
      data: url,
    });
    await Linking.openURL(url);
    debug('onOpenAuthorizationUrl after openUrl: ', url);
  };

  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.BROWSER_OPEN,
    params: {
      onNext: () => onOpenAuthorizationUrl(url),
      url,
      onBack,
    },
  });
};

const navigateReviewCredentialOffers = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {oid4vciMachine, navigation, state, onBack, onNext} = args;
  const {credentialsToAccept, contact, openId4VcIssuanceProvider} = state.context;
  const localeBranding: Array<IBasicCredentialLocaleBranding> | undefined = openId4VcIssuanceProvider?.credentialBranding?.get(
    state.context.selectedCredentials[0],
  );

  const onDecline = async (): Promise<void> => {
    oid4vciMachine.send(OID4VCIMachineEvents.DECLINE);
  };

  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
    params: {
      headerTitle: translate('credential_offer_title'),
      rawCredential: credentialsToAccept[0].rawVerifiableCredential,
      credential: await toNonPersistedCredentialSummary(credentialsToAccept[0].uniformVerifiableCredential!, localeBranding, contact),
      primaryAction: {
        caption: translate('action_accept_label'),
        onPress: onNext,
      },
      secondaryAction: {
        caption: translate('action_decline_label'),
        onPress: onDecline,
      },
      onBack,
    },
  });
};

const navigateFinal = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, oid4vciMachine} = args;

  debug(`Stopping oid4vci machine...`);
  oid4vciMachine.stop();
  debug(`Stopped oid4vci machine`);

  navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
    screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
  });
};

const navigateError = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, onBack, onNext} = args;
  const {error} = state.context;

  if (!error) {
    return Promise.reject(Error('Missing error in context'));
  }

  navigation.navigate(MainRoutesEnum.OID4VCI, {
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

export const oid4vciStateNavigationListener = async (
  oid4vciMachine: OID4VCIMachineInterpreter,
  state: OID4VCIMachineState,
  navigation?: NativeStackNavigationProp<any>,
): Promise<void> => {
  debug('oid4vciStateNavigationListener: ', state.value);
  if (state._event.type === 'internal') {
    debug('oid4vciStateNavigationListener: internal event');
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }
  const onBack = () => oid4vciMachine.send(OID4VCIMachineEvents.PREVIOUS);
  const onNext = () => oid4vciMachine.send(OID4VCIMachineEvents.NEXT);

  const nav = navigation ?? RootNavigation;
  if (nav === undefined || !nav.isReady()) {
    console.log(`navigation not ready yet`);
    return;
  }

  if (
    state.matches(OID4VCIMachineStates.initiateOID4VCIProvider) ||
    state.matches(OID4VCIMachineStates.createCredentialSelection) ||
    state.matches(OID4VCIMachineStates.retrieveContact) ||
    state.matches(OID4VCIMachineStates.transitionFromSetup) ||
    state.matches(OID4VCIMachineStates.transitionFromWalletInput) ||
    state.matches(OID4VCIMachineStates.retrieveCredentials) ||
    state.matches(OID4VCIMachineStates.waitForAuthorizationResponse)
  ) {
    return navigateLoading({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.addContact)) {
    return navigateAddContact({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.selectCredentials)) {
    return navigateSelectCredentials({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.verifyPin)) {
    return navigatePINVerification({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.initiateAuthorizationRequest)) {
    return navigateAuthorizationCodeURL({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.reviewCredentials)) {
    return navigateReviewCredentialOffers({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.handleError)) {
    return navigateError({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (
    state.matches(OID4VCIMachineStates.done) ||
    state.matches(OID4VCIMachineStates.error) ||
    state.matches(OID4VCIMachineStates.aborted) ||
    state.matches(OID4VCIMachineStates.declined)
  ) {
    return navigateFinal({oid4vciMachine, state, navigation: nav, onNext, onBack});
  }
};

export const OID4VCIProvider = (props: OID4VCIProviderProps): JSX.Element => {
  const {children, customOID4VCIInstance} = props;

  return <OID4VCIContext.Provider value={{oid4vciInstance: customOID4VCIInstance}}>{children}</OID4VCIContext.Provider>;
};
