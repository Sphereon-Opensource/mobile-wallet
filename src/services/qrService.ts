import {PresentationDefinitionWithLocation, RPRegistrationMetadataPayload, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {CredentialOfferClient} from '@sphereon/oid4vci-client';
import {
  CredentialIssuerMetadata,
  CredentialResponse,
  CredentialSupported,
  EndpointMetadata,
  IssuerMetadataV1_0_08,
  MetadataDisplay,
} from '@sphereon/oid4vci-common';
import {Format} from '@sphereon/pex-models';
import {
  ConnectionTypeEnum,
  CorrelationIdentifierEnum,
  IBasicConnection,
  IBasicCredentialLocaleBranding,
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
  PresentationSubmission,
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
import OpenId4VcIssuanceProvider, {CredentialFromOffer, IErrorDetailsOpts} from '../providers/credential/OpenId4VcIssuanceProvider';
import store from '../store';
import {addIdentity} from '../store/actions/contact.actions';
import {storeVerifiableCredential} from '../store/actions/credential.actions';
import {
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
import {addCredentialBranding, selectAppLocaleBranding} from './brandingService';
import {getContacts} from './contactService';
import {verifyCredential} from './credentialService';
import {getOrCreatePrimaryIdentifier} from './identityService';
import RootNavigation from '../navigation/rootNavigation';

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

  if (qrData.startsWith(QrTypesEnum.OPENID_INITIATE_ISSUANCE) || qrData.startsWith(QrTypesEnum.OPENID_CREDENTIAL_OFFER)) {
    return await parseOpenID4VCI(qrData).catch(error => {
      debug(`Unable to parse QR value as openid-initiate-issuance. Error: ${error}`);
      return Promise.reject(Error(translate('qr_scanner_qr_not_supported_message')));
    });
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

const parseOpenID4VCI = async (qrData: string): Promise<IQrData> => {
  if (qrData.includes(QrTypesEnum.OPENID_INITIATE_ISSUANCE)) {
    return Promise.resolve({
      type: QrTypesEnum.OPENID_INITIATE_ISSUANCE,
      credentialOffer: await CredentialOfferClient.fromURI(qrData),
      uri: qrData,
    });
  } else {
    return Promise.resolve({
      type: QrTypesEnum.OPENID_CREDENTIAL_OFFER,
      credentialOffer: await CredentialOfferClient.fromURI(qrData),
      uri: qrData,
    });
  }
};

export const processQr = async (args: IQrDataArgs): Promise<void> => {
  switch (args.qrData.type) {
    case QrTypesEnum.AUTH:
      if ((args.qrData as IQrAuthentication).mode === ConnectionTypeEnum.SIOPv2) {
        return connectDidAuth(args);
      }
      break;
    case QrTypesEnum.SIOPV2:
    case QrTypesEnum.OPENID_VC:
    case QrTypesEnum.OPENID4VC:
      return connectSiopV2(args);
    case QrTypesEnum.OPENID_CREDENTIAL_OFFER:
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
  //const url: URL = new URL(decodeURIComponent(args.qrData.uri.split('?request_uri=')[1].trim()));
  const config = {
    // FIXME: Update these values in SSI-SDK. Only the URI (not a redirectURI) would be available at this point
    sessionId: uuidv4(),
    redirectUrl: args.qrData.uri,
    stateId: args.qrData.state,
    identifier: await getOrCreatePrimaryIdentifier(), // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  };

  // Adding a loading screen as the next action is to contact the other side
  args.navigation.navigate(NavigationBarRoutesEnum.QR, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });

  let request: VerifiedAuthorizationRequest;
  let registration: RPRegistrationMetadataPayload | undefined;
  let url: string;
  let name: string | undefined;
  try {
    request = await siopGetRequest({...config, id: uuidv4()});
    // TODO: Makes sense to move these types of common queries/retrievals to the SIOP auth request object
    registration = request.registrationMetadataPayload;
    name = registration?.client_name;
    url =
      request.responseURI ??
      (args.qrData.uri.includes('request_uri')
        ? decodeURIComponent(args.qrData.uri.split('?request_uri=')[1].trim())
        : request.issuer ?? request.registrationMetadataPayload?.client_id);
  } catch (error: unknown) {
    debug(translate('information_retrieve_failed_toast_message', {errorMessage: (error as Error).message}));
    args.navigation.navigate(ScreenRoutesEnum.QR_READER, {});
    showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('information_retrieve_failed_toast_message', {errorMessage: (error as Error).message})});
    return;
  }

  const uri = url.includes('://') ? new URL(url) : undefined;
  const correlationIdName = uri
    ? translateCorrelationIdToName(uri.hostname)
    : request.issuer
    ? translateCorrelationIdToName(request.issuer.split('://')[1])
    : name;
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
          message: translate('credentials_share_success_toast_message', {verifierName: registration?.client_name ?? correlationIdName}),
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
    const clientId: string | undefined = (await request.authorizationRequest.getMergedProperty<string>('client_id')) ?? request.issuer;
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
                correlationId: request.issuer ?? request.registrationMetadataPayload?.client_id ?? correlationId,
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
        verifier: name ?? correlationIdName ?? correlationId,
        // TODO currently only supporting 1 presentation definition
        presentationDefinition: presentationDefinitionWithLocation.definition,
        format,
        subjectSyntaxTypesSupported,
        onDecline: async (): Promise<void> =>
          args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
            screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
          }),
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
            correlationId: uri ? uri.hostname : correlationIdName,
          },
        },
      },
    ],
  }).then((contacts: Array<IContact>) => {
    if (contacts.length === 0) {
      args.navigation.navigate(NavigationBarRoutesEnum.QR, {
        screen: ScreenRoutesEnum.CONTACT_ADD,
        params: {
          name: name ?? correlationIdName ?? uri?.hostname,
          uri: `${uri?.protocol}//${uri?.hostname}`,
          identities: [
            {
              alias: uri?.hostname,
              roles: [IdentityRoleEnum.VERIFIER],
              identifier: {
                type: CorrelationIdentifierEnum.URL,
                correlationId: uri?.hostname,
              },
              connection: {
                type: ConnectionTypeEnum.SIOPv2,
                config,
              },
            },
          ],
          onDecline: async (): Promise<void> =>
            args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
              screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
            }),
          // Adding a delay here, so the store is updated with the new contact. And we only have a delay when a new contact is created
          onCreate: () => delay(1000).then(() => selectRequiredCredentials()),
        },
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

export function getIssuerDisplays(metadata: CredentialIssuerMetadata | IssuerMetadataV1_0_08, opts?: {prefLocales: string[]}): MetadataDisplay[] {
  const matchedDisplays =
    metadata.display?.filter(
      item => !opts?.prefLocales || opts.prefLocales.length === 0 || (item.locale && opts.prefLocales.includes(item.locale)) || !item.locale,
    ) ?? [];
  return matchedDisplays.sort(item => (item.locale ? opts?.prefLocales.indexOf(item.locale) ?? 1 : Number.MAX_VALUE));
}
/**
 * TODO check again when WAL-617 is done to replace how we get the issuer name.
 */
function getName(metadata: IServerMetadataAndCryptoMatchingResponse, url: string) {
  const displays = metadata.serverMetadata.credentialIssuerMetadata ? getIssuerDisplays(metadata.serverMetadata.credentialIssuerMetadata) : [];
  let name;
  for (const display of displays) {
    if (display.name) {
      name = display.name;
      break;
    }
  }
  if (!name) {
    name = url;
  }
  return name;
}

const connectOpenId4VcIssuance = async (args: IQrDataArgs): Promise<void> => {
  const sendResponseOrCreateContact = async (provider: OpenId4VcIssuanceProvider): Promise<void> => {
    const metadata: IServerMetadataAndCryptoMatchingResponse = await provider.getServerMetadataAndPerformCryptoMatching();
    const serverMetadata: EndpointMetadata = metadata.serverMetadata;
    const correlationId = `${new URL(serverMetadata.issuer).protocol}//${new URL(serverMetadata.issuer).hostname}`;
    const name: string = getName(metadata, correlationId);
    getContacts({
      filter: [
        {
          identities: {
            identifier: {
              correlationId: new URL(serverMetadata.issuer).hostname,
            },
          },
        },
      ],
    }).then((contacts: Array<IContact>) => {
      if (contacts.length === 0) {
        args.navigation.navigate(NavigationBarRoutesEnum.QR, {
          screen: ScreenRoutesEnum.CONTACT_ADD,
          params: {
            name,
            uri: correlationId,
            identities: [
              {
                alias: correlationId,
                roles: [IdentityRoleEnum.ISSUER],
                identifier: {
                  type: CorrelationIdentifierEnum.URL,
                  correlationId: new URL(serverMetadata.issuer).hostname,
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
            onDecline: async (): Promise<void> =>
              args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
                screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
              }),
            // Adding a delay here, so the store is updated with the new contact. And we only have a delay when a new contact is created
            onCreate: () => delay(1000).then(() => sendResponseOrSelectCredentials(provider)),
          },
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
    const credentialsSupported = metadata.credentialsSupported;
    const credentialTypeSelection: Array<ICredentialTypeSelection> = await Promise.all(
      credentialsSupported?.map(async (credentialMetadata: CredentialSupported) => {
        // FIXME this allows for duplicate VerifiableCredential, which the user has no idea which ones those are and we also have a branding map with unique keys, so some branding will not match
        const credentialType = credentialMetadata.types.find(t => t !== 'VerifiableCredential') ?? 'VerifiableCredential';
        return {
          id: uuidv4(),
          credentialType,
          credentialAlias:
            (await selectAppLocaleBranding({localeBranding: metadata.credentialBranding.get(credentialType)}))?.alias || credentialType,
          isSelected: false,
        };
      }),
    );

    if (credentialTypeSelection.length > 1) {
      args.navigation.navigate(NavigationBarRoutesEnum.QR, {
        screen: ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE,
        params: {
          issuer: translateCorrelationIdToName(new URL(metadata.serverMetadata.issuer).hostname),
          credentialTypes: credentialTypeSelection,
          onSelect: async (credentialTypes: Array<string>) => {
            args.navigation.navigate(NavigationBarRoutesEnum.QR, {
              screen: ScreenRoutesEnum.LOADING,
              params: {
                message: translate('action_getting_credentials_message'),
              },
            });
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
    if (args.qrData.credentialOffer.userPinRequired) {
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
      .then(async (credentialOffers: Array<CredentialFromOffer>) => {
        const metadata: IServerMetadataAndCryptoMatchingResponse = await provider.getServerMetadataAndPerformCryptoMatching();
        // TODO only supporting one credential for now
        const credentialResponse: CredentialResponse = credentialOffers[0].credentialResponse;
        const origVC: W3CVerifiableCredential | undefined = credentialResponse.credential;
        const wrappedVC: WrappedVerifiableCredential = CredentialMapper.toWrappedVerifiableCredential(origVC as OriginalVerifiableCredential);
        const verificationResult: IVerificationResult = await verifyCredential({
          credential: origVC as VerifiableCredential | CompactJWT,
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

        const issuerCorrelationId = new URL(metadata.serverMetadata.issuer).hostname;
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
          const correlationId: string = typeof uniformVC.issuer === 'string' ? uniformVC.issuer : (uniformVC.issuer as IIssuer).id;
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
            await delay(1000);
          }
        }

        const rawCredential: VerifiableCredential = credentialResponse.credential as unknown as VerifiableCredential;
        // TODO fix the store not having the correct action types (should include ThunkAction)
        const storeCredential = async (vc: VerifiableCredential) => store.dispatch<any>(storeVerifiableCredential(vc));

        const localeBranding: Array<IBasicCredentialLocaleBranding> | undefined = metadata.credentialBranding.get(credentialTypes[0]); // TODO only supporting one credential for now
        // We are specifically navigating to a stack, so that when a deeplink is used the navigator knows in which stack it is
        args.navigation.navigate(NavigationBarRoutesEnum.QR, {
          screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
          params: {
            headerTitle: translate('credential_offer_title'),
            rawCredential,
            credential: await toNonPersistedCredentialSummary(uniformVC, localeBranding),
            primaryAction: {
              caption: translate('action_accept_label'),
              onPress: async () => {
                if (localeBranding && localeBranding?.length > 0) {
                  await addCredentialBranding({
                    vcHash: computeEntryHash(rawCredential),
                    issuerCorrelationId,
                    localeBranding,
                  });
                }
                storeCredential(rawCredential)
                  .then(() => {
                    args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
                      screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
                    });
                    showToast(ToastTypeEnum.TOAST_SUCCESS, {
                      message: translate('credential_offer_accepted_toast'),
                      showBadge: false,
                    });
                  })
                  .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, {message: error.message}));
              },
            },
            secondaryAction: {
              caption: translate('action_decline_label'),
              onPress: async () => {
                args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
                  screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
                });
              },
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

    args.navigation.navigate(NavigationBarRoutesEnum.QR, {
      screen: ScreenRoutesEnum.ERROR,
      params: {
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
      },
    });
  };

  args.navigation.navigate(NavigationBarRoutesEnum.QR, {
    screen: ScreenRoutesEnum.LOADING,
    params: {
      message: translate('action_getting_information_message'),
    },
  });

  OpenId4VcIssuanceProvider.initiationFromUri({uri: args.qrData.uri})
    .then((provider: OpenId4VcIssuanceProvider) =>
      provider.getServerMetadataAndPerformCryptoMatching().then(() => sendResponseOrCreateContact(provider)),
    )
    .catch((error: Error) => {
      console.log(`Unable to retrieve vc. Error: ${error}`);
      args.navigation.navigate(ScreenRoutesEnum.QR_READER, {});
      showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('information_retrieve_failed_toast_message', {errorMessage: error.message})});
    });
};
