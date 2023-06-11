import {PresentationDefinitionWithLocation, RPRegistrationMetadataPayload, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {CredentialIssuer, CredentialResponse, EndpointMetadata, IssuanceInitiation, IssuerDisplay} from '@sphereon/openid4vci-client';
import {Format} from '@sphereon/pex-models';
import {
  ConnectionTypeEnum,
  CorrelationIdentifierEnum,
  IBasicConnection,
  IBasicIdentity,
  IContact,
  IdentityRoleEnum,
  IDidAuthConfig,
  IIdentity,
} from '@sphereon/ssi-sdk.data-store';
import {
  CredentialMapper,
  IVerifiableCredential,
  OriginalVerifiableCredential,
  W3CVerifiableCredential,
  WrappedVerifiableCredential,
} from '@sphereon/ssi-types';
import {IIssuer} from '@sphereon/ssi-types/src/types/vc';
import {VerifiableCredential} from '@veramo/core';
import {CompactJWT} from '@veramo/core/src/types/vc-data-model';
import {computeEntryHash} from '@veramo/utils';
import Debug from 'debug';
import {URL} from 'react-native-url-polyfill';

import {APP_ID} from '../@config/constants';
import {translate} from '../localization/Localization';
import {siopGetRequest, siopSendAuthorizationResponse} from '../providers/authentication/SIOPv2Provider';
import JwtVcPresentationProfileProvider from '../providers/credential/JwtVcPresentationProfileProvider';
import OpenId4VcIssuanceProvider, {IErrorDetailsOpts} from '../providers/credential/OpenId4VcIssuanceProvider';
import store from '../store';
import {addIdentity} from '../store/actions/contact.actions';
import {storeVerifiableCredential} from '../store/actions/credential.actions';
import {
  ICredentialMetadata,
  ICredentialTypeSelection,
  IErrorDetails,
  IQrAuthentication,
  IQrData,
  IQrDataArgs,
  IQrDidSiopAuthenticationRequest,
  IReadQrArgs,
  IServerMetadataAndCryptoMatchingResponse,
  IVerificationResult,
  NavigationBarRoutesEnum,
  Oidc4vciErrorEnum,
  PopupImagesEnum,
  QrTypesEnum,
  ScreenRoutesEnum,
  ToastTypeEnum,
} from '../types';
import {delay} from '../utils/AppUtils';
import {translateCorrelationIdToName} from '../utils/CredentialUtils';
import {filterNavigationStack} from '../utils/NavigationUtils';
import {showToast} from '../utils/ToastUtils';
import {toNonPersistedCredentialSummary} from '../utils/mappers/credential/CredentialMapper';

import {authenticate} from './authenticationService';
import {createCredentialBranding, selectAppLocaleBranding} from './brandingService';
import {getContacts} from './contactService';
import {verifyCredential} from './credentialService';
import {getOrCreatePrimaryIdentifier} from './identityService';

const {v4: uuidv4} = require('uuid');
const debug: Debug.Debugger = Debug(`${APP_ID}:qrService`);

export const readQr = async (args: IReadQrArgs): Promise<void> => {
  parseQr(args.qrData)
    .then((qrData: IQrData) => processQr({qrData, navigation: args.navigation}))
    .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, {message: error.message}));
};

export const parseQr = async (qrData: string): Promise<IQrData> => {
  try {
    const parsedJson = JSON.parse(qrData);
    if (parsedJson && typeof parsedJson === 'object') {
      return parsedJson;
    }
  } catch (error: unknown) {
    debug(`Unable to parse QR value as JSON. Error: ${error}`);
  }

  try {
    const param = new URL(qrData).searchParams.get('oob');
    if (param) {
      return {
        ...JSON.parse(Buffer.from(param, 'base64').toString('utf8')),
        redirectUrl: qrData,
      };
    }
  } catch (error: unknown) {
    debug(`Unable to parse QR value as URL. Error: ${error}`);
  }

  if (qrData.startsWith(QrTypesEnum.OPENID_INITIATE_ISSUANCE)) {
    try {
      return parseOpenID4VCI(qrData);
    } catch (error: unknown) {
      debug(`Unable to parse QR value as openid-initiate-issuance. Error: ${error}`);
    }
  } else if (qrData.startsWith(QrTypesEnum.OPENID_VC) || qrData.startsWith(QrTypesEnum.OPENID)) {
    try {
      return parseSIOPv2(qrData);
    } catch (error: unknown) {
      debug(`Unable to parse QR value as openid-vc. Error: ${error}`);
    }
  }

  return Promise.reject(Error(translate('qr_scanner_qr_not_supported_message')));
};

const parseSIOPv2 = (qrData: string): Promise<IQrData> => {
  try {
    return Promise.resolve({
      type: QrTypesEnum.OPENID_VC,
      uri: qrData,
    });
  } catch (error: unknown) {
    return Promise.reject(error);
  }
};

const parseOpenID4VCI = (qrData: string): Promise<IQrData> => {
  try {
    return Promise.resolve({
      type: QrTypesEnum.OPENID_INITIATE_ISSUANCE,
      issuanceInitiation: IssuanceInitiation.fromURI(qrData),
      uri: qrData,
    });
  } catch (error: unknown) {
    return Promise.reject(error);
  }
};

export const processQr = async (args: IQrDataArgs): Promise<void> => {
  switch (args.qrData.type) {
    case QrTypesEnum.AUTH:
      switch ((args.qrData as IQrAuthentication).mode) {
        case ConnectionTypeEnum.SIOPv2:
          return connectDidAuth(args);
      }
      break;
    case QrTypesEnum.SIOPV2:
    case QrTypesEnum.OPENID_VC:
      return connectSiopV2(args);
    case QrTypesEnum.OPENID_INITIATE_ISSUANCE:
      return connectOpenId4VcIssuance(args);
  }
};

// TODO remove old flow
const connectDidAuth = async (args: IQrDataArgs): Promise<void> => {
  const identifier = await getOrCreatePrimaryIdentifier(); // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  const verifier = decodeURIComponent(args.qrData.uri.split('?request_uri=')[1]);
  const connection: IBasicConnection = {
    type: ConnectionTypeEnum.SIOPv2,
    config: {
      identifier,
      stateId: (args.qrData as IQrDidSiopAuthenticationRequest).state,
      redirectUrl: (args.qrData as IQrDidSiopAuthenticationRequest).redirectUrl,
      sessionId: (args.qrData as IQrDidSiopAuthenticationRequest).redirectUrl + identifier.did,
    },
  };

  const connect = async (): Promise<void> => {
    const verifiedAuthorizationRequest: VerifiedAuthorizationRequest = await siopGetRequest({
      ...connection.config,
      id: uuidv4,
    } as IDidAuthConfig);
    args.navigation.navigate(ScreenRoutesEnum.CREDENTIALS_REQUIRED, {
      verifier,
      presentationDefinition: verifiedAuthorizationRequest.presentationDefinitions![0].definition,
    });
  };

  authenticate(connect)
    .then(() => console.log('authentication success'))
    .catch(error => {
      if (!/UserCancel|UserFallback|SystemCancel/.test(error.name)) {
        console.error('Error', error);
      }
    });
};

const connectSiopV2 = async (args: IQrDataArgs): Promise<void> => {
  const url: URL = new URL(decodeURIComponent(args.qrData.uri.split('?request_uri=')[1].trim()));
  const config = {
    // FIXME: Update these values in SSI-SDK. Only the URI (not a redirectURI) would be available at this point
    sessionId: uuidv4(),
    redirectUrl: args.qrData.uri,
    stateId: args.qrData.state,
    identifier: await getOrCreatePrimaryIdentifier(), // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  };

  // Adding a loading screen as the next action is to contact the other side
  args.navigation.navigate(ScreenRoutesEnum.LOADING, {message: translate('action_getting_information_message')});

  let request: VerifiedAuthorizationRequest;
  let registration: RPRegistrationMetadataPayload | undefined;
  try {
    request = await siopGetRequest({...config, id: uuidv4()});
    // TODO: Makes sense to move these types of common queries/retrievals to the SIOP auth request object
    registration = await request.authorizationRequest.getMergedProperty('registration');
  } catch (error: unknown) {
    debug(`Unable to retrieve information. Error: ${(error as Error).message}.`);
    args.navigation.navigate(ScreenRoutesEnum.QR_READER, {});
    showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('information_retrieve_failed_toast_message', {errorMessage: (error as Error).message})});
  }

  const sendResponse = async (
    presentationDefinitionWithLocation: PresentationDefinitionWithLocation,
    credentials: Array<VerifiableCredential>,
  ): Promise<void> => {
    siopSendAuthorizationResponse(ConnectionTypeEnum.SIOPv2_OpenID4VP, {
      sessionId: config.sessionId,
      verifiableCredentialsWithDefinition: [
        {
          definition: presentationDefinitionWithLocation,
          credentials: credentials as Array<W3CVerifiableCredential>,
        },
      ],
    })
      .then(() => {
        args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
          screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
        });
        showToast(ToastTypeEnum.TOAST_SUCCESS, {
          title: translate('credentials_share_success_toast_title'),
          message: translate('credentials_share_success_toast_message', {verifierName: translateCorrelationIdToName(url.hostname)}),
        });
      })
      .catch((error: Error) => {
        debug(`Unable to present credentials. Error: ${error.message}.`);
        args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {});
        showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('credentials_share_failed_toast_message', {errorMessage: error.message})});
      });
  };

  const selectRequiredCredentials = async (): Promise<void> => {
    // TODO: Makes sense to move these types of common queries/retrievals to the SIOP auth request object
    const format: Format | undefined = registration?.vp_formats;
    const subjectSyntaxTypesSupported: Array<string> | undefined = registration?.subject_syntax_types_supported;
    const clientId: string | undefined = await request.authorizationRequest.getMergedProperty<string>('client_id');
    const correlationId: string | undefined = clientId
      ? clientId.startsWith('did:')
        ? clientId
        : `${new URL(clientId).protocol}//${new URL(clientId).hostname}`
      : undefined;
    if (correlationId) {
      const contacts: Array<IContact> = await getContacts({
        filter: [
          {
            identities: {
              identifier: {
                correlationId: url.hostname,
              },
            },
          },
        ],
      });
      if (contacts.length === 1) {
        const hasIdentity: IContact | undefined = contacts.find((contact: IContact) =>
          contact.identities.some((identity: IIdentity) => identity.identifier.correlationId === correlationId),
        );
        if (!hasIdentity) {
          const identity: IBasicIdentity = {
            alias: correlationId,
            roles: [IdentityRoleEnum.VERIFIER],
            identifier: {
              type: correlationId.startsWith('did:') ? CorrelationIdentifierEnum.DID : CorrelationIdentifierEnum.URL,
              correlationId,
            },
            ...(!correlationId.startsWith('did:') && {
              connection: {
                type: ConnectionTypeEnum.SIOPv2,
                config: {
                  ...config,
                  redirectUrl: correlationId,
                },
              },
            }),
          };
          store.dispatch<any>(addIdentity({contactId: contacts[0].id, identity}));
        }
      }
    }

    // TODO SIOPv2 and OID4VP are separate. In other words SIOP doesn't require OID4VP. This means that presentation definitions are optional.
    // TODO In that case we should skip the required credentials and send the response
    if (!request.presentationDefinitions || request.presentationDefinitions.length === 0) {
      return Promise.reject(Error('No presentation definitions present'));
    }
    if (request.presentationDefinitions.length > 1) {
      return Promise.reject(Error('Multiple presentation definitions present'));
    }
    const presentationDefinitionWithLocation: PresentationDefinitionWithLocation = request.presentationDefinitions![0];

    args.navigation.navigate(NavigationBarRoutesEnum.QR, {
      screen: ScreenRoutesEnum.CREDENTIALS_REQUIRED,
      params: {
        verifier: translateCorrelationIdToName(url.hostname),
        // TODO currently only supporting 1 presentation definition
        presentationDefinition: presentationDefinitionWithLocation.definition,
        format,
        subjectSyntaxTypesSupported,
        onSend: async (credentials: Array<OriginalVerifiableCredential>) =>
          authenticate(async () => {
            args.navigation.navigate(ScreenRoutesEnum.LOADING, {message: translate('action_sharing_credentials_message')});
            await sendResponse(presentationDefinitionWithLocation, credentials as Array<VerifiableCredential>);
          }),
      },
    });
    filterNavigationStack({
      navigation: args.navigation,
      stack: NavigationBarRoutesEnum.QR,
      filter: [ScreenRoutesEnum.LOADING, ScreenRoutesEnum.CONTACT_ADD],
    });
  };

  getContacts({
    filter: [
      {
        identities: {
          identifier: {
            correlationId: url.hostname,
          },
        },
      },
    ],
  }).then((contacts: Array<IContact>) => {
    if (contacts.length === 0) {
      args.navigation.navigate(ScreenRoutesEnum.CONTACT_ADD, {
        name: registration?.client_name ?? url.hostname,
        uri: `${url.protocol}//${url.hostname}`,
        identities: [
          {
            alias: url.hostname,
            roles: [IdentityRoleEnum.VERIFIER],
            identifier: {
              type: CorrelationIdentifierEnum.URL,
              correlationId: url.hostname,
            },
            connection: {
              type: ConnectionTypeEnum.SIOPv2,
              config,
            },
          },
        ],
        // Adding a delay here, so the store is updated with the new contact. And we only have a delay when a new contact is created
        onCreate: () => delay(1000).then(() => selectRequiredCredentials()),
      });
    } else {
      selectRequiredCredentials();
    }
  });
};

const connectJwtVcPresentationProfile = async (args: IQrDataArgs): Promise<void> => {
  if (args.qrData.pin) {
    const manifest = await new JwtVcPresentationProfileProvider().getManifest(args.qrData);
    args.navigation.navigate(ScreenRoutesEnum.VERIFICATION_CODE, {
      pinLength: args.qrData.pin.length,
      credentialName: manifest.display.card.title || '[MISSING CREDENTIAL NAME]', // TODO translate
      // TODO WAL-301 need to send a response with a pin code to complete the process.
      onVerification: async (pin: string) =>
        await args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
          screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
        }),
    });
  }
  // TODO WAL-301 need to send a response when we do not need a pin code
};

const connectOpenId4VcIssuance = async (args: IQrDataArgs): Promise<void> => {
  const sendResponseOrCreateContact = async (provider: OpenId4VcIssuanceProvider): Promise<void> => {
    const serverMetadata: EndpointMetadata = (await provider.getServerMetadataAndPerformCryptoMatching()).serverMetadata;
    const url: URL = new URL(serverMetadata.issuer); // TODO fix non null assertion
    const name: string | IssuerDisplay = serverMetadata?.openid4vci_metadata?.credential_issuer?.['name' as keyof CredentialIssuer] ?? url.hostname;
    getContacts({
      filter: [
        {
          identities: {
            identifier: {
              correlationId: url.hostname,
            },
          },
        },
      ],
    }).then((contacts: Array<IContact>) => {
      if (contacts.length === 0) {
        args.navigation.navigate(ScreenRoutesEnum.CONTACT_ADD, {
          name,
          uri: `${url.protocol}//${url.hostname}`,
          identities: [
            {
              alias: url.hostname,
              roles: [IdentityRoleEnum.ISSUER],
              identifier: {
                type: CorrelationIdentifierEnum.URL,
                correlationId: url.hostname,
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
          // Adding a delay here, so the store is updated with the new contact. And we only have a delay when a new contact is created
          onCreate: () => delay(1000).then(() => sendResponseOrSelectCredentials(provider)),
        });
        filterNavigationStack({
          navigation: args.navigation,
          stack: NavigationBarRoutesEnum.QR,
          filter: [ScreenRoutesEnum.LOADING],
        });
      } else {
        sendResponseOrSelectCredentials(provider);
      }
    });
  };

  const sendResponseOrSelectCredentials = async (provider: OpenId4VcIssuanceProvider): Promise<void> => {
    const metadata: IServerMetadataAndCryptoMatchingResponse = await provider.getServerMetadataAndPerformCryptoMatching();
    const credentialTypeSelection: Array<ICredentialTypeSelection> = await Promise.all(
      metadata.credentialsSupported.map(async (credentialMetadata: ICredentialMetadata) => ({
        id: uuidv4(),
        credentialType: credentialMetadata.credentialType,
        credentialAlias:
          (await selectAppLocaleBranding({localeBranding: metadata.credentialBranding.get(credentialMetadata.credentialType)}))?.alias ||
          credentialMetadata.credentialType,
        isSelected: false,
      })),
    );

    if (credentialTypeSelection.length > 1) {
      args.navigation.navigate(NavigationBarRoutesEnum.QR, {
        screen: ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE,
        params: {
          issuer: translateCorrelationIdToName(new URL(args.qrData.issuanceInitiation.issuanceInitiationRequest.issuer).hostname),
          credentialTypes: credentialTypeSelection,
          onSelect: async (credentialTypes: Array<string>) => {
            args.navigation.navigate(ScreenRoutesEnum.LOADING, {message: translate('action_getting_credentials_message')});
            await sendResponseOrAuthenticate(provider, credentialTypes);
          },
        },
      });
      filterNavigationStack({
        navigation: args.navigation,
        stack: NavigationBarRoutesEnum.QR,
        filter: [ScreenRoutesEnum.LOADING],
      });
    } else {
      await sendResponseOrAuthenticate(
        provider,
        credentialTypeSelection.map((credentialSelection: ICredentialTypeSelection) => credentialSelection.credentialType),
      );
    }
  };

  const sendResponseOrAuthenticate = async (provider: OpenId4VcIssuanceProvider, credentials: Array<string>): Promise<void> => {
    if (
      args.qrData.issuanceInitiation.issuanceInitiationRequest.user_pin_required === 'true' ||
      args.qrData.issuanceInitiation.issuanceInitiationRequest.user_pin_required === true
    ) {
      args.navigation.navigate(NavigationBarRoutesEnum.QR, {
        screen: ScreenRoutesEnum.VERIFICATION_CODE,
        params: {
          // Currently we only support receiving one credential, we are missing ui to display multiple
          credentialName: credentials[0],
          onVerification: async (pin: string) => await sendResponse(provider, credentials, pin),
        },
      });
      filterNavigationStack({
        navigation: args.navigation,
        stack: NavigationBarRoutesEnum.QR,
        filter: [ScreenRoutesEnum.LOADING],
      });
    } else {
      await sendResponse(provider, credentials);
    }
  };

  const sendResponse = async (provider: OpenId4VcIssuanceProvider, credentialTypes: Array<string>, pin?: string): Promise<void> =>
    provider
      .getCredentialsFromIssuance({pin, credentials: credentialTypes})
      .then(async (credentialsResponse: Record<string, CredentialResponse>) => {
        const metadata: IServerMetadataAndCryptoMatchingResponse = await provider.getServerMetadataAndPerformCryptoMatching();

        // TODO only supporting one credential for now
        const credentialResponse: CredentialResponse = Object.values(credentialsResponse)[0];
        const origVC: W3CVerifiableCredential = credentialResponse.credential;
        const wrappedVC: WrappedVerifiableCredential = CredentialMapper.toWrappedVerifiableCredential(origVC);
        const verificationResult: IVerificationResult = await verifyCredential({
          credential: wrappedVC.original as VerifiableCredential | CompactJWT,
          fetchRemoteContexts: true,
          policies: {credentialStatus: false, expirationDate: false, issuanceDate: false},
        });
        if (!verificationResult.result || verificationResult.error) {
          console.log(JSON.stringify(verificationResult, null, 2));
          return handleError(Oidc4vciErrorEnum.VERIFICATION_FAILED, {
            detailsMessage: verificationResult.errorDetails,
            message: verificationResult.error,
            title: 'Invalid credential',
          });
        }
        const uniformVC: IVerifiableCredential = wrappedVC.credential;

        const issuerCorrelationId: string = new URL(metadata.serverMetadata.issuer).hostname;
        const contacts: Array<IContact> = await getContacts({
          filter: [
            {
              identities: {
                identifier: {
                  correlationId: issuerCorrelationId,
                },
              },
            },
          ],
        });
        if (contacts.length === 1) {
          const correlationId: string = (uniformVC.issuer as IIssuer).id;
          const identity: IBasicIdentity = {
            alias: correlationId,
            roles: [IdentityRoleEnum.ISSUER],
            identifier: {
              type: CorrelationIdentifierEnum.DID,
              correlationId,
            },
          };
          const hasIdentity: IContact | undefined = contacts.find((contact: IContact) =>
            contact.identities.some((identity: IIdentity) => identity.identifier.correlationId === correlationId),
          );
          if (!hasIdentity) {
            store.dispatch<any>(addIdentity({contactId: contacts[0].id, identity}));
          }
        }

        const rawCredential: VerifiableCredential = credentialResponse.credential as unknown as VerifiableCredential;
        // TODO fix the store not having the correct action types (should include ThunkAction)
        const storeCredential = async (vc: VerifiableCredential) => store.dispatch<any>(storeVerifiableCredential(vc));

        // We are specifically navigating to a stack, so that when a deeplink is used the navigator knows in which stack it is
        args.navigation.navigate(NavigationBarRoutesEnum.QR, {
          screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
          params: {
            headerTitle: translate('credential_offer_title'),
            rawCredential,
            credential: await toNonPersistedCredentialSummary(uniformVC, metadata.credentialBranding.get(credentialTypes[0])), // TODO only supporting one credential for now
            primaryAction: {
              caption: translate('action_accept_label'),
              onPress: async () =>
                createCredentialBranding({
                  vcHash: computeEntryHash(rawCredential),
                  issuerCorrelationId,
                  localeBranding: metadata.credentialBranding.get(credentialTypes[0])!, // TODO only supporting one credential for now
                })
                  .then(() => storeCredential(rawCredential))
                  .then(() => {
                    args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
                      screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
                    });
                    showToast(ToastTypeEnum.TOAST_SUCCESS, {
                      message: translate('credential_offer_accepted_toast'),
                      showBadge: false,
                    });
                  })
                  .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, {message: error.message})),
            },
            secondaryAction: {
              caption: translate('action_decline_label'),
              onPress: async () => args.navigation.goBack(),
            },
          },
        });
        filterNavigationStack({
          navigation: args.navigation,
          stack: NavigationBarRoutesEnum.QR,
          filter: [ScreenRoutesEnum.LOADING, ScreenRoutesEnum.VERIFICATION_CODE],
        });
      })
      .catch((error: Error) => {
        // TODO refactor once the lib returns a proper response object
        const errorResponse = error.message.includes('response:') ? JSON.parse(error.message.split('response:')[1].trim()) : error.message;
        if (error.message.includes('403') || errorResponse.status === 403) {
          return Promise.reject(error);
        }
        handleError(errorResponse);
      });

  const handleError = (errorResponse: Oidc4vciErrorEnum | any, opts?: IErrorDetailsOpts) => {
    const errorDetails: IErrorDetails = OpenId4VcIssuanceProvider.getErrorDetails(errorResponse, opts);
    const errorMessage = errorResponse?.error_description || errorResponse;

    args.navigation.navigate(ScreenRoutesEnum.ERROR, {
      image: PopupImagesEnum.WARNING,
      title: errorDetails.title,
      details: errorDetails.message,
      ...(errorMessage && {
        detailsPopup: {
          buttonCaption: translate('action_view_extra_details'),
          title: errorDetails.detailsTitle,
          details: `${errorDetails?.detailsMessage} ${errorMessage}`,
        },
      }),
      primaryButton: {
        caption: translate('action_ok_label'),
        onPress: async () => args.navigation.navigate(ScreenRoutesEnum.QR_READER, {}),
      },
    });
  };

  args.navigation.navigate(ScreenRoutesEnum.LOADING, {message: translate('action_getting_information_message')});

  OpenId4VcIssuanceProvider.initiationFromUri({uri: args.qrData.uri})
    .then((provider: OpenId4VcIssuanceProvider) =>
      provider.getServerMetadataAndPerformCryptoMatching().then(() => sendResponseOrCreateContact(provider)),
    )
    .catch((error: Error) => {
      debug(`Unable to retrieve vc. Error: ${error}`);
      args.navigation.navigate(ScreenRoutesEnum.QR_READER, {});
      showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('information_retrieve_failed_toast_message', {errorMessage: error.message})});
    });
};
