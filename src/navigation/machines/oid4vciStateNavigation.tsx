import {getIssuerName} from '@sphereon/oid4vci-common';
import React, {Context, createContext, JSX} from 'react';
import * as WebBrowser from 'expo-web-browser';
import {URL} from 'react-native-url-polyfill';
import {SimpleEventsOf} from 'xstate';
import Debug, {Debugger} from 'debug';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  ConnectionType,
  CorrelationIdentifierType,
  CredentialDocumentFormat,
  IBasicCredentialLocaleBranding,
  IdentityOrigin,
  NonPersistedParty,
  Party,
  PartyOrigin,
  PartyTypeType,
} from '@sphereon/ssi-sdk.data-store-types';
import {
  ActionType,
  CredentialMapper,
  CredentialRole,
  DefaultActionSubType,
  DocumentFormat,
  InitiatorType,
  LogLevel,
  SubSystem,
  System,
} from '@sphereon/ssi-types';
import {
  CreateContactEvent,
  FirstPartyMachineEvents,
  FirstPartyMachineInterpreter,
  FirstPartyMachineNavigationArgs,
  FirstPartyMachineState,
  FirstPartyMachineStateTypes,
  OID4VCIContext as OID4VCIContextType,
  OID4VCIMachineEvents,
  OID4VCIMachineInterpreter,
  OID4VCIMachineNavigationArgs,
  OID4VCIMachineState,
  OID4VCIMachineStates,
  OID4VCIProviderProps,
} from '@sphereon/ssi-sdk.oid4vci-holder';
import {translate} from '../../localization/Localization';
import RootNavigation from './../rootNavigation';
import {APP_ID} from '../../@config/constants';
import {MainRoutesEnum, NavigationBarRoutesEnum, PopupImagesEnum, ScreenRoutesEnum} from '../../types';
import {toCredentialSummary, toNonPersistedCredentialSummary} from '@sphereon/ui-components.credential-branding';
import {getCredentialIssuerContact, getCredentialSubjectContact, lookupFederationParties} from '../../utils';
import store from '../../store';
import {storeActivityLogging} from '../../store/actions/logging.actions';
import {computeEntryHash} from '@veramo/utils';
import {VerifiableCredential} from '@veramo/core';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {authenticate} from '../../services/authenticationService';
import {getVerifiableCredentialsFromStorage} from '../../services/credentialService';
import IntentHandler from '../../handlers/IntentHandler';

const debug: Debugger = Debug(`${APP_ID}:oid4vciStateNavigation`);

const OID4VCIContext: Context<OID4VCIContextType> = createContext({} as OID4VCIContextType);

const navigateLoading = async (navigation: NativeStackNavigationProp<any>): Promise<void> => {
  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });
};

const navigateAddContact = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onBack} = args;
  const {serverMetadata, trustedAnchors, issuerBranding} = state.context;

  if (!serverMetadata) {
    return Promise.reject(Error('Missing server metadata in context'));
  }

  const issuerUrl: URL = new URL(serverMetadata.issuer);
  const correlationId: string = `${issuerUrl.protocol}//${issuerUrl.hostname}`;
  const issuerName: string = getIssuerName(correlationId, serverMetadata.credentialIssuerMetadata);

  const contact: NonPersistedParty = {
    contact: {
      displayName: issuerName,
      legalName: issuerName,
    },
    // FIXME maybe its nicer if we can also just use the id only
    // TODO using the predefined party type from the contact migrations here
    // TODO this is not used as the screen itself adds one, look at the params of the screen, this is not being passed in
    partyType: {
      id: '3875c12e-fdaa-4ef6-a340-c936e054b627',
      origin: PartyOrigin.EXTERNAL,
      type: PartyTypeType.ORGANIZATION,
      name: 'Sphereon_default_type',
      tenantId: '95e09cfc-c974-4174-86aa-7bf1d5251fb4',
    },
    uri: correlationId,
    identities: [
      {
        alias: correlationId,
        roles: [CredentialRole.ISSUER],
        origin: IdentityOrigin.EXTERNAL,
        identifier: {
          type: CorrelationIdentifierType.URL,
          correlationId: issuerUrl.hostname,
        },
        // TODO WAL-476 add support for correct connection
        connection: {
          type: ConnectionType.OPENID_CONNECT,
          config: {
            clientId: 'https://sphereon.com/ssi-wallet',
            clientSecret: '',
            scopes: ['auth'],
            issuer: correlationId,
            redirectUrl: 'https://sphereon.com/ssi-wallet/oid4vci-callback',
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

  const federationParties = await lookupFederationParties(contact, trustedAnchors);

  const branding = issuerBranding?.[0] ?? {};
  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.NEW_CONTACT_ADD,
    params: {
      name: contact.contact.displayName,
      federations: federationParties,
      uri: contact.uri,
      identities: contact.identities,
      contacts: branding.contacts,
      logo: branding.logo,
      description: branding.description,
      clientUri: branding.clientUri,
      tosUri: branding.tosUri,
      policyUri: branding.policyUri,
      roles: [CredentialRole.ISSUER],
      onAliasChange,
      onCreate,
      onDecline,
      onBack,
      isCreateDisabled,
    },
  });
};

const navigateReviewContact = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onBack, onNext} = args;
  const {contact, issuerBranding, trustedAnchors} = state.context;

  if (!contact) {
    return Promise.reject(Error('Missing contact in context'));
  }

  const onDecline = async (): Promise<void> => {
    oid4vciMachine.send(OID4VCIMachineEvents.DECLINE);
  };

  const federationParties = await lookupFederationParties(contact, trustedAnchors);

  const branding = issuerBranding?.[0] ?? {};
  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.NEW_CONTACT_ADD,
    params: {
      name: contact.contact.displayName,
      federations: federationParties,
      uri: contact.uri,
      logo: branding.logo,
      description: branding.description,
      contacts: branding.contacts,
      clientUri: branding.clientUri,
      tosUri: branding.tosUri,
      policyUri: branding.policyUri,
      roles: contact.roles,
      onContinue: onNext,
      onDecline,
      onBack,
    },
  });
};

const navigateSelectCredentials = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onNext, onBack} = args;
  const {contact, selectedCredentials} = state.context;

  if (!contact) {
    return Promise.reject(Error('Missing contact in context'));
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

  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE,
    params: {
      issuer: contact.contact.displayName,
      credentialTypes: selectedCredentials,
      onSelectType,
      onSelect: onNext,
      onBack,
      isSelectDisabled,
    },
  });
};

const navigatePINVerification = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, state, oid4vciMachine, onBack} = args;
  const {selectedCredentials, requestData} = state.context;
  const txCode = requestData?.credentialOffer?.txCode;
  // Small delay to let React Navigation settle when transitioning directly from reviewContact via always-transitions
  setTimeout(() => {
    navigation.navigate(MainRoutesEnum.OID4VCI, {
      screen: ScreenRoutesEnum.VERIFICATION_CODE,
      params: {
        pinLength: txCode?.length,
        inputMode: txCode?.input_mode,
        description: txCode?.description,
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
  }, 100);
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
    const callbackScheme = 'com.sphereon.ssi.wallet'
    IntentHandler.getInstance().setAuthSessionActive(true);
    const result = await WebBrowser.openAuthSessionAsync(url, `${callbackScheme}://oid4vci-callback`)
    IntentHandler.getInstance().setAuthSessionActive(false);
    debug('onOpenAuthorizationUrl auth session result: ', JSON.stringify(result))
    if (result.type === 'success' && result.url) {
      oid4vciMachine.send({
        type: OID4VCIMachineEvents.PROVIDE_AUTHORIZATION_CODE_RESPONSE,
        data: result.url,
      })
    } else if (result.type === 'dismiss') {
      // On iOS, universal links cause the IntentHandler to receive the callback and dismiss the auth session.
      // The deep link URL (with the authorization code) is stored in IntentHandler and won't reach us via
      // openAuthSessionAsync. Retrieve it and forward to the machine.
      const intentHandler = IntentHandler.getInstance();
      const deepLinkUrl = intentHandler.consumeDeepLink();
      if (deepLinkUrl && deepLinkUrl.includes('oid4vci-callback')) {
        debug('Auth session dismissed but deep link contains authorization code, forwarding to machine')
        oid4vciMachine.send({
          type: OID4VCIMachineEvents.PROVIDE_AUTHORIZATION_CODE_RESPONSE,
          data: deepLinkUrl,
        })
      } else {
        debug('Auth session dismissed without authorization code')
      }
    } else if (result.type === 'cancel') {
      debug('User cancelled the authorization session')
    }
  };

  const confirmBrowserOpen = store.getState().user.activeUser?.preferences?.confirmBrowserOpen ?? true;
  if (!confirmBrowserOpen) {
    return onOpenAuthorizationUrl(url);
  }

  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.BROWSER_OPEN,
    params: {
      onNext: () => onOpenAuthorizationUrl(url),
      url,
      onBack,
    },
  });
};

const navigateReviewCredentials = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {oid4vciMachine, navigation, state, onBack, onNext} = args;
  const {credentialsToAccept, contact, credentialBranding} = state.context;
  // The selectedCredential from context is the configurationId, whilst we store the branding by type. We need to map
  const configId = state.context.selectedCredentials[0];
  const types = credentialsToAccept
    .find(ac => ac.correlationId === configId || ac.credentialToAccept.id === configId || ac.types.includes(configId))
    ?.types?.filter(type => type != 'VerifiableCredential') ?? [];


  const localeBranding: Array<IBasicCredentialLocaleBranding> = credentialBranding?.[configId] ?? []
  if (localeBranding.length === 0 ) {
    for (const type of types) {
      const branding = credentialBranding?.[type] ?? []
      if (branding.length > 0) {
        localeBranding.push(...branding)
      }
    }
  }

  const onDecline = async (): Promise<void> => {
    oid4vciMachine.send(OID4VCIMachineEvents.DECLINE);

    // FIXME temp solution to have activity for oid4vci-holder, we should add this to the plugin later
    function determineCredentialDocumentFormat(documentFormat: DocumentFormat): CredentialDocumentFormat {
      switch (documentFormat) {
        case DocumentFormat.JSONLD:
          return CredentialDocumentFormat.JSON_LD;
        case DocumentFormat.JWT:
          return CredentialDocumentFormat.JWT;
        case DocumentFormat.SD_JWT_VC:
          return CredentialDocumentFormat.SD_JWT;
        case DocumentFormat.MSO_MDOC:
          return CredentialDocumentFormat.MSO_MDOC;
        default:
          throw new Error(`Not supported document format: ${documentFormat}`);
      }
    }

    const uniform = credentialsToAccept[0].uniformVerifiableCredential as VerifiableCredential;
    const issuer: Party | undefined = getCredentialIssuerContact(uniform);
    const credentialSummary = await toCredentialSummary({
      verifiableCredential: uniform,
      hash: uniform.hash,
      credentialRole: uniform.credentialRole,
      branding: localeBranding,
      issuer,
      subject: getCredentialSubjectContact(uniform),
    });

    // FIXME temp solution to have activity for oid4vci-holder, we should add this to the plugin later
    store.dispatch<any>(
      storeActivityLogging({
        level: LogLevel.INFO,
        system: System.OID4VCI,
        subSystemType: SubSystem.VC_ISSUER,
        initiatorType: InitiatorType.SYSTEM,
        description: 'decline credential',
        actionType: ActionType.READ,
        actionSubType: DefaultActionSubType.VC_ISSUE_DECLINE,
        // @ts-ignore
        credentialType: determineCredentialDocumentFormat(CredentialMapper.detectDocumentType(credentialsToAccept[0].rawVerifiableCredential)),
        // @ts-ignore
        credentialHash: credentialsToAccept[0].uniformVerifiableCredential.id ?? computeEntryHash(credentialsToAccept[0].uniformVerifiableCredential),
        originalCredential: JSON.stringify(credentialsToAccept[0].uniformVerifiableCredential),
        data: {
          credential: credentialSummary,
        },
        // @ts-ignore
        partyCorrelationType: contact?.identities[0].identifier.type, // TODO fix types
        partyCorrelationId: contact?.identities[0].identifier.correlationId,
        partyAlias: contact?.contact.displayName,
      }),
    );
  };

  const signingMode = credentialsToAccept.find(cred => !!cred.credential_subject_issuance);

  let credentialSummary;
  try {
    credentialSummary = await toNonPersistedCredentialSummary({
      verifiableCredential: credentialsToAccept[0].uniformVerifiableCredential,
      credentialRole: CredentialRole.HOLDER,
      branding: localeBranding,
      issuer: contact,
      subject: getCredentialSubjectContact(credentialsToAccept[0].uniformVerifiableCredential),
    });
  } catch (error) {
    debug(`Failed to create credential summary for review: ${error}`);
    console.error('Failed to create credential summary for review', error);
    navigation.navigate(MainRoutesEnum.OID4VCI, {
      screen: ScreenRoutesEnum.ERROR,
      params: {
        image: PopupImagesEnum.WARNING,
        title: translate('oid4vci_machine_retrieve_credentials_error_title'),
        details: error instanceof Error ? error.message : translate('error_details_generic_title'),
        primaryButton: {
          caption: translate('action_ok_label'),
          onPress: async () => oid4vciMachine.send(OID4VCIMachineEvents.DECLINE),
        },
        onBack,
      },
    });
    return;
  }

  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
    params: {
      headerTitle: translate(signingMode ? 'credential_sign_title' : 'credential_offer_title'),
      rawCredential: credentialsToAccept[0].rawVerifiableCredential,
      hideLinks: true,
      credential: credentialSummary,
      primaryAction: {
        caption: translate(signingMode ? 'action_sign_label' : 'action_accept_label'),
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

const navigateSelectCredentialsToPresent = async (args: FirstPartyMachineNavigationArgs): Promise<void> => {
  const {firstPartyMachine, navigation, state, onBack, onNext} = args;

  const {authorizationRequestData, contact} = state.context;

  if (authorizationRequestData === undefined) {
    return Promise.reject(Error('Missing authorization request data in context'));
  }


  const onSelect = async (selectedCredentials: Array<UniqueDigitalCredential>): Promise<void> => {
    firstPartyMachine.send({
      type: FirstPartyMachineEvents.SET_SELECTED_CREDENTIALS,
      data: selectedCredentials,
    });
  };

  const onDecline = async (): Promise<void> => {
    firstPartyMachine.send(FirstPartyMachineEvents.DECLINE);
  };

  const onSend = async (): Promise<void> => {
    const onAuthenticate = async (): Promise<void> => {
      onNext?.();
    };
    await authenticate(onAuthenticate);
  };

  const onSelectAndSend = async (credentials: UniqueDigitalCredential[]): Promise<void> => {
    await onSelect(credentials);
    setTimeout(() => {
      // FIXME Funke; wait for machine event, but we need to set a state somewhere that onSelectAndSend was used so we know to proceed to onSend()
      onSend();
    }, 600);
  };

  const credentials = await getVerifiableCredentialsFromStorage({parentsOnly: false});
  // fixme: we should pass the hasher function here from the RP
  navigation.navigate(MainRoutesEnum.OID4VCI, {
    screen: ScreenRoutesEnum.CREDENTIAL_SHARE_OVERVIEW,
    params: {
      verifier: contact,
      dcqlQuery: authorizationRequestData.dcqlQuery,
      credentials,
      onBack,
      onDecline,
      onSelectAndSend,
    },
  });
};

const navigateFinal = async (args: OID4VCIMachineNavigationArgs): Promise<void> => {
  const {navigation, oid4vciMachine} = args;

  debug('Stopping oid4vci machine...');
  oid4vciMachine.stop();
  debug('Stopped oid4vci machine');

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
        accessibilityLabel: `${translate('action_ok_label')}. Exit flow`,
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

  // FIXME quick hack to stop the navigation from resetting as the add contact screen now uses a modal which is another screen
  if (state._event.name === 'SET_CONTACT_ALIAS') {
    return;
  }

  const onBack = () => oid4vciMachine.send(OID4VCIMachineEvents.PREVIOUS);
  const onNext = () => oid4vciMachine.send(OID4VCIMachineEvents.NEXT);

  const nav = navigation ?? RootNavigation;
  if (nav === undefined || !nav.isReady()) {
    console.log(`navigation not ready yet`);
    return;
  }

  if (state.matches(OID4VCIMachineStates.addContact)) {
    return navigateAddContact({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.reviewContact)) {
    return navigateReviewContact({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.selectCredentials)) {
    return navigateSelectCredentials({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.verifyPin)) {
    return navigatePINVerification({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.initiateAuthorizationRequest)) {
    return navigateAuthorizationCodeURL({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.reviewCredentials)) {
    return navigateReviewCredentials({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (state.matches(OID4VCIMachineStates.handleError)) {
    console.error(state._event.data);
    return navigateError({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else if (
    state.matches(OID4VCIMachineStates.done) ||
    state.matches(OID4VCIMachineStates.error) ||
    state.matches(OID4VCIMachineStates.aborted) ||
    state.matches(OID4VCIMachineStates.declined)
  ) {
    return navigateFinal({oid4vciMachine, state, navigation: nav, onNext, onBack});
  } else {
    return navigateLoading(nav);
  }
};

export const OID4VCIProvider = (props: OID4VCIProviderProps): JSX.Element => {
  const {children, customOID4VCIInstance} = props;

  return <OID4VCIContext.Provider value={{oid4vciInstance: customOID4VCIInstance}}>{children}</OID4VCIContext.Provider>;
};

export const firstPartyStateNavigationListener = async (
  firstPartyMachine: FirstPartyMachineInterpreter,
  state: FirstPartyMachineState,
  navigation?: NativeStackNavigationProp<any>,
): Promise<void> => {
  debug('firstPartyStateNavigationListener: ', state.value);
  if (state._event.type === 'internal') {
    debug('firstPartyStateNavigationListener: internal event');
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }

  const onBack = () => firstPartyMachine.send(FirstPartyMachineEvents.PREVIOUS);
  const onNext = () => firstPartyMachine.send(FirstPartyMachineEvents.NEXT);

  const nav = navigation ?? RootNavigation;
  if (nav === undefined || !nav.isReady()) {
    console.log(`navigation not ready yet`);
    return;
  }

  if (state.matches(FirstPartyMachineStateTypes.selectCredentials)) {
    return navigateSelectCredentialsToPresent({firstPartyMachine, state, navigation: nav, onNext, onBack});
  } else if (
    state.matches(FirstPartyMachineStateTypes.sendAuthorizationChallengeRequest) ||
    state.matches(FirstPartyMachineStateTypes.sendAuthorizationResponse) ||
    state.matches(FirstPartyMachineStateTypes.createConfig) ||
    state.matches(FirstPartyMachineStateTypes.getSiopRequest)
  ) {
    return navigateLoading(nav);
  }
};
