import React, {Context, createContext} from 'react';
import {URL} from 'react-native-url-polyfill';
import {SimpleEventsOf} from 'xstate';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  ConnectionTypeEnum,
  CorrelationIdentifierEnum,
  IBasicCredentialLocaleBranding,
  IContact,
  IdentityRoleEnum,
} from '@sphereon/ssi-sdk.data-store';
import OpenId4VcIssuanceProvider from '../../providers/credential/OpenId4VcIssuanceProvider';
import {toNonPersistedCredentialSummary} from '../../utils/mappers/credential/CredentialMapper';
import {translate} from '../../localization/Localization';
import RootNavigation from './../rootNavigation';
import {
  CreateContactEvent,
  OID4VCIContext as OID4VCIContextType,
  OID4VCIMachineEvents,
  OID4VCIMachineInterpreter,
  OID4VCIMachineNavigationArgs,
  OID4VCIMachineState,
  OID4VCIMachineStates,
  OIDVCIProviderProps,
} from '../../types/machines/oid4vci';
import {NavigationBarRoutesEnum, PopupImagesEnum, QRRoutesEnum, ScreenRoutesEnum} from '../../types';
import Debug, {Debugger} from 'debug';
import {APP_ID} from '../../@config/constants';

const debug: Debugger = Debug(`${APP_ID}:oid4vciStateNavigation`);

const OID4VCIContext: Context<OID4VCIContextType> = createContext({} as OID4VCIContextType);

const navigateLoading = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(QRRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });
};

const navigateAddContact = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onBack} = args;
  const {openId4VcIssuanceProvider, hasContactConsent} = state.context;
  const issuerUrl: URL = new URL(state.context.openId4VcIssuanceProvider!.serverMetadata!.issuer);
  const correlationId: string = `${issuerUrl.protocol}//${issuerUrl.hostname}`;

  const contact = {
    name: OpenId4VcIssuanceProvider.getIssuerName(correlationId, openId4VcIssuanceProvider!.serverMetadata!.credentialIssuerMetadata),
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

  const onCreate = async (contact: IContact): Promise<void> => {
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

  navigation.navigate(ScreenRoutesEnum.CONTACT_ADD, {
    name: contact.name,
    uri: contact.uri,
    identities: contact.identities,
    hasConsent: hasContactConsent,
    onAliasChange,
    onConsentChange,
    onCreate,
    onDecline,
    onBack,
    isCreateDisabled,
  });
};

const navigateSelectCredentials = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onNext, onBack} = args;
  const {contact, supportedCredentials} = state.context;

  if (!contact) {
    return Promise.reject(Error('Missing contact'));
  }

  const onSelectType = async (selectedCredentials: Array<string>): Promise<void> => {
    oid4vciMachine.send({
      type: OID4VCIMachineEvents.SET_SELECTED_CREDENTIALS,
      data: selectedCredentials,
    });
  };

  const isSelectDisabled = (): boolean => {
    return oid4vciMachine.getSnapshot()?.can(OID4VCIMachineEvents.NEXT) !== true;
  };

  navigation.navigate(ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE, {
    issuer: contact.alias,
    credentialTypes: supportedCredentials,
    onSelectType,
    onSelect: onNext,
    onBack,
    isSelectDisabled,
  });
};

const navigateAuthentication = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onBack} = args;
  const {selectedCredentials} = state.context;
  navigation.navigate(ScreenRoutesEnum.VERIFICATION_CODE, {
    credentialName: selectedCredentials[0],
    credentialTypes: [],
    onVerification: async (pin: string): Promise<void> => {
      oid4vciMachine.send([
        {
          type: OID4VCIMachineEvents.SET_VERIFICATION_CODE,
          data: pin,
        },
        OID4VCIMachineEvents.NEXT,
      ]);
    },
    onBack,
  });
};

const navigateReviewCredentialOffers = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  // TODO rename without offers
  const {oid4vciMachine, navigation, state, onBack, onNext} = args;
  const {credentialOffers, contact} = state.context;
  // TODO null ref // TODO supporting 1
  const localeBranding: Array<IBasicCredentialLocaleBranding> | undefined = state.context.openId4VcIssuanceProvider!.credentialBranding!.get(
    state.context.selectedCredentials[0],
  );

  const onDecline = async (): Promise<void> => {
    oid4vciMachine.send(OID4VCIMachineEvents.DECLINE);
  };

  navigation.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
    headerTitle: translate('credential_offer_title'),
    rawCredential: credentialOffers[0].rawVerifiableCredential,
    credential: await toNonPersistedCredentialSummary(credentialOffers[0].uniformVerifiableCredential, localeBranding, contact),
    primaryAction: {
      caption: translate('action_accept_label'),
      onPress: onNext,
    },
    secondaryAction: {
      caption: translate('action_decline_label'),
      onPress: onDecline,
    },
    onBack,
  });
};

const navigateFinal = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation} = args;
  navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
    screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
  });
};

const navigateError = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, onBack, onNext} = args;
  const {error} = state.context;
  if (error === undefined) {
    return;
  }

  navigation.navigate(ScreenRoutesEnum.ERROR, {
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
  });
};

export const oid4vciStateNavigationListener = async (
  oid4vciMachine: OID4VCIMachineInterpreter,
  state: OID4VCIMachineState,
  navigation?: NativeStackNavigationProp<any>,
): Promise<void> => {
  if (state._event.type === 'internal') {
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    return;
  }
  const onBack = () => oid4vciMachine.send(OID4VCIMachineEvents.PREVIOUS);
  const onNext = () => oid4vciMachine.send(OID4VCIMachineEvents.NEXT);

  const nav = navigation ?? RootNavigation;
  if (nav === undefined || !nav.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }

  if (
    state.matches(OID4VCIMachineStates.initiate) ||
    state.matches(OID4VCIMachineStates.createCredentialSelection) ||
    state.matches(OID4VCIMachineStates.retrieveContact) ||
    state.matches(OID4VCIMachineStates.transitionFromSetup) ||
    state.matches(OID4VCIMachineStates.transitionFromWalletInput) ||
    state.matches(OID4VCIMachineStates.retrieveCredentialsOffers)
  ) {
    return navigateLoading({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.addContact)) {
    return navigateAddContact({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.selectCredentials)) {
    return navigateSelectCredentials({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.verifyPin)) {
    return navigateAuthentication({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.reviewCredentials)) {
    return navigateReviewCredentialOffers({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.showError)) {
    return navigateError({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (
    state.matches(OID4VCIMachineStates.done) ||
    state.matches(OID4VCIMachineStates.error) ||
    state.matches(OID4VCIMachineStates.aborted) ||
    state.matches(OID4VCIMachineStates.declined)
  ) {
    return navigateFinal({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else {
    return Promise.reject(Error(`Navigation for ${JSON.stringify(state)} is not implemented!`)); // Should not happen, so we throw an error
  }
};

export const OID4VCIProvider = (props: OIDVCIProviderProps): JSX.Element => {
  const {children, customOID4VCIInstance} = props;

  return <OID4VCIContext.Provider value={{oid4vciInstance: customOID4VCIInstance}}>{children}</OID4VCIContext.Provider>;
};