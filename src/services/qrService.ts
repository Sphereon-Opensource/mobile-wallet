import { VerifiedAuthorizationRequest } from '@sphereon/did-auth-siop'
import { CredentialResponse, IssuanceInitiation } from '@sphereon/openid4vci-client'
import {
  ConnectionTypeEnum,
  CorrelationIdentifierEnum, IBasicConnection,
  IBasicIdentity,
  IContact,
  IdentityRoleEnum, IDidAuthConfig,
  IIdentity
} from '@sphereon/ssi-sdk-data-store'
import {CredentialMapper, W3CVerifiableCredential} from '@sphereon/ssi-types'
import { IIssuer } from '@sphereon/ssi-types/src/types/vc'
import { VerifiableCredential } from '@veramo/core'
import Debug from 'debug'
import { URL } from 'react-native-url-polyfill'

import { APP_ID } from '../@config/constants'
import { translate } from '../localization/Localization'
import RootNavigation from '../navigation/rootNavigation'
import {
  siopGetRequest,
  siopSendAuthorizationResponse
} from '../providers/authentication/SIOPv2Provider'
import JwtVcPresentationProfileProvider
  from '../providers/credential/JwtVcPresentationProfileProvider'
import OpenId4VcIssuanceProvider from '../providers/credential/OpenId4VcIssuanceProvider'
import store from '../store'
import { addIdentity } from '../store/actions/contact.actions'
import { storeVerifiableCredential } from '../store/actions/credential.actions'
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
  NavigationBarRoutesEnum,
  PopupImagesEnum,
  QrTypesEnum,
  ScreenRoutesEnum,
  ToastTypeEnum
} from '../types'
import { showToast } from '../utils/ToastUtils'
import { toCredentialSummary } from '../utils/mappers/CredentialMapper'

import { authenticate } from './authenticationService'
import { getContacts } from './contactService'
import { getOrCreatePrimaryIdentifier } from './identityService'

const { v4: uuidv4 } = require('uuid')
const format = require('string-format')
const debug = Debug(`${APP_ID}:qrService`)

export const readQr = async (args: IReadQrArgs): Promise<void> => {
  parseQr(args.qrData)
    .then((qrData: IQrData) => processQr({qrData, navigation: args.navigation}))
    .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, { message: error.message }));
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

const connectDidAuth = async (args: IQrDataArgs): Promise<void> => {
  const identifier = await getOrCreatePrimaryIdentifier(); // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  const verifier = decodeURIComponent(args.qrData.uri.split('?request_uri=')[1]) // TODO WAL-525 implement contact name
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
    const verifiedAuthorizationRequest: VerifiedAuthorizationRequest = await siopGetRequest({ ...connection.config, id: uuidv4} as IDidAuthConfig)
    RootNavigation.navigate(ScreenRoutesEnum.CREDENTIALS_REQUIRED, {
      verifier,
      presentationDefinition: verifiedAuthorizationRequest.presentationDefinitions![0].definition
    });
  }

  authenticate(connect)
    .then(() => console.log('authentication success'))
    .catch(error => {
      if (!/UserCancel|UserFallback|SystemCancel/.test(error.name)) {
        console.error('Error', error);
      }
    });
};

const connectSiopV2 = async (args: IQrDataArgs): Promise<void> => {
  const identifier = await getOrCreatePrimaryIdentifier(); // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  const sessionId = uuidv4() // TODO why is args.qrData.id undefined?
  const verifier = decodeURIComponent(args.qrData.uri.split('?request_uri=')[1]) // TODO WAL-525 implement contact name
  const request: VerifiedAuthorizationRequest = await siopGetRequest({
      id: uuidv4(),
      // FIXME: Update these values in SSI-SDK. Only the URI (not a redirectURI) would be available at this point
      sessionId,
      redirectUrl: args.qrData.uri,
      stateId: args.qrData.state,
      identifier
  });

  if (!request.presentationDefinitions || request.presentationDefinitions.length === 0) {
    return Promise.reject(Error('No presentation definitions present'))
  }

  if (request.presentationDefinitions.length > 1) {
    return Promise.reject(Error('Multiple presentation definitions present'))
  }

  const onSend = async (credentials: Array<VerifiableCredential>): Promise<void> => {
    siopSendAuthorizationResponse(ConnectionTypeEnum.SIOPv2_OpenID4VP, {
      sessionId,
      verifiableCredentialsWithDefinition: [{
        definition: request.presentationDefinitions![0],
        credentials: credentials as Array<W3CVerifiableCredential>
      }]
    })
    .then(() => {
      RootNavigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
        screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
      });
      showToast(ToastTypeEnum.TOAST_SUCCESS, {
        title: translate('credentials_share_success_toast_title'),
        message: format(translate('credentials_share_success_toast_message'), verifier)
      });
    })
    // TODO make human-readable message
    .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, { message: error.message }));
  };

  RootNavigation.navigate(ScreenRoutesEnum.CREDENTIALS_REQUIRED, {
    verifier,
    // TODO currently only supporting 1 presentation definition
    presentationDefinition: request.presentationDefinitions[0].definition,
    onSend: async (credentials: Array<VerifiableCredential>) => authenticate(() => onSend(credentials))
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
  const sendResponseOrCreateContact = async (metadata: IServerMetadataAndCryptoMatchingResponse): Promise<void> => {
    const url = new URL(metadata.serverMetadata.issuer);
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
          name: url.host,
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
          onCreate: () => sendResponseOrSelectCredentials(metadata.credentialsSupported),
        });
      } else {
        sendResponseOrSelectCredentials(metadata.credentialsSupported);
      }
    });
  };

  const sendResponseOrSelectCredentials = async (credentialsSupported: Array<ICredentialMetadata>): Promise<void> => {
    const credentialTypes: Array<ICredentialTypeSelection> = credentialsSupported.map((credentialMetadata: ICredentialMetadata) => ({
      id: uuidv4(),
      credentialType: credentialMetadata.credentialType,
      isSelected: true,
    }));

    if (credentialTypes.length > 1) {
      args.navigation.navigate(ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE, {
        issuer: args.qrData.issuanceInitiation.issuanceInitiationRequest.issuer,
        credentialTypes: credentialsSupported.map((credentialMetadata: ICredentialMetadata) => ({
          id: uuidv4(),
          credentialType: credentialMetadata.credentialType,
          isSelected: true,
        })),
        onAccept: async (credentialTypes: Array<string>) => await sendResponseOrAuthenticate(credentialTypes),
      });
    } else {
      await sendResponseOrAuthenticate(credentialTypes.map((credentialSelection: ICredentialTypeSelection) => credentialSelection.credentialType));
    }
  };

  const sendResponseOrAuthenticate = async (credentials: Array<string>): Promise<void> => {
    if (
      args.qrData.issuanceInitiation.issuanceInitiationRequest.user_pin_required === 'true' ||
      args.qrData.issuanceInitiation.issuanceInitiationRequest.user_pin_required === true
    ) {
      args.navigation.navigate(NavigationBarRoutesEnum.QR, {
        screen: ScreenRoutesEnum.VERIFICATION_CODE,
        params: {
          // Currently we only support receiving one credential, we are missing ui to display multiple
          credentialName: credentials[0],
          onVerification: async (pin: string) => await sendResponse(provider, pin),
        },
      });
    } else {
      await sendResponse(provider);
    }
  };

  const sendResponse = async (provider: OpenId4VcIssuanceProvider, pin?: string): Promise<void> =>
    provider
      .getCredentialsFromIssuance({pin})
      .then(async (credentialsResponse: Record<string, CredentialResponse>) => {
        const metadata = await provider.getServerMetadataAndPerformCryptoMatching()
        for (const credentialResponse of Object.values(credentialsResponse)) {
          const vc = CredentialMapper.toUniformCredential(credentialResponse.credential);

          const contacts = await getContacts({
            filter: [{
              identities: {
                identifier: {
                  correlationId: new URL(metadata.serverMetadata.issuer).hostname,
                }
              }
            }]
          })
          if (contacts.length > 0) {
            const correlationId = (vc.issuer as IIssuer).id
            const identity: IBasicIdentity = {
              alias: correlationId,
              roles: [IdentityRoleEnum.ISSUER],
              identifier: {
                type: CorrelationIdentifierEnum.DID,
                correlationId: correlationId
              }
            }
            const hasIdentity = contacts.find((contact: IContact) => contact.identities.some((identity: IIdentity) => identity.identifier.correlationId === correlationId))
            if (!hasIdentity) {
              // await setTimeout(async () => {
                store.dispatch<any>(addIdentity({ contactId: contacts[0].id, identity }))
              // }, 1000);
            }
          }

          const rawCredential = credentialResponse.credential as unknown as VerifiableCredential;
          // TODO fix the store not having the correct action types (should include ThunkAction)
          const storeCredential = async (vc: VerifiableCredential) => store.dispatch<any>(storeVerifiableCredential(vc));

          await setTimeout(async () => {
            // We are specifically navigating to a stack, so that when a deeplink is used the navigator knows in which stack it is
            args.navigation.navigate(NavigationBarRoutesEnum.QR, {
                screen: ScreenRoutesEnum.CREDENTIAL_DETAILS,
                params: {
                  rawCredential,
                  credential: toCredentialSummary(vc),
                  primaryAction: {
                    caption: translate('action_accept_label'),
                    onPress: async () =>
                      storeCredential(rawCredential)
                      .then(() =>
                        args.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
                          screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW,
                        }),
                      )
                      .then(() => showToast(ToastTypeEnum.TOAST_SUCCESS, { message: translate('credential_offer_accepted_toast'), showBadge: false }))
                      .catch((error: Error) => showToast(ToastTypeEnum.TOAST_ERROR, { message: error.message })),
                  },
                  secondaryAction: {
                    caption: translate('action_decline_label'),
                    onPress: async () => args.navigation.navigate(ScreenRoutesEnum.QR_READER),
                  },
                },
              }
            );
          }, 1000);
        }
      })
      .catch((error: Error) => {
        // TODO refactor once the lib returns a proper response object
        const errorResponse = error.message.includes('response:') ? JSON.parse(error.message.split('response:')[1].trim()) : error.message;
        if (error.message.includes('403') || errorResponse.status === 403) {
          return Promise.reject(error);
        }
        const errorDetails: IErrorDetails = OpenId4VcIssuanceProvider.getErrorDetails(errorResponse.error);

        args.navigation.navigate(ScreenRoutesEnum.ERROR, {
          image: PopupImagesEnum.WARNING,
          title: errorDetails.title,
          details: errorDetails.message,
          detailsPopup: {
            buttonCaption: translate('action_view_extra_details'),
            title: errorDetails.detailsTitle,
            details: `${errorDetails.detailsMessage} ${errorResponse.error_description}`,
          },
          primaryButton: {
            caption: translate('action_ok_label'),
            onPress: async () => args.navigation.navigate(ScreenRoutesEnum.QR_READER, {}),
          },
        });
      });

  const provider = await OpenId4VcIssuanceProvider.initiationFromUri({uri: args.qrData.uri});
  provider
    .getServerMetadataAndPerformCryptoMatching()
    .then((metadata: IServerMetadataAndCryptoMatchingResponse) => sendResponseOrCreateContact(metadata))
    .catch((error: Error) => {
      debug(`Unable to retrieve vc. Error: ${error}`);
      //TODO create human readable error message
      showToast(ToastTypeEnum.TOAST_ERROR, { message: error.message });
    });
};
