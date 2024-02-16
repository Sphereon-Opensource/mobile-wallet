import {VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {convertURIToJsonObject, CredentialOfferClient} from '@sphereon/oid4vci-client';
import {ConnectionTypeEnum, DidAuthConfig, NonPersistedConnection} from '@sphereon/ssi-sdk.data-store';
import {IIdentifier} from '@veramo/core';
import Debug, {Debugger} from 'debug';
import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import {APP_ID} from '../@config/constants';
import {oid4vciHolderGetMachineInterpreter} from '../agent';
import {translate} from '../localization/Localization';
import {SiopV2Machine} from '../machines/siopV2Machine';
import {oid4vciStateNavigationListener} from '../navigation/machines/oid4vciStateNavigation';
import {siopGetRequest} from '../providers/authentication/SIOPv2Provider';
import JwtVcPresentationProfileProvider from '../providers/credential/JwtVcPresentationProfileProvider';
import {
  IQrAuthentication,
  IQrData,
  IQrDataArgs,
  IQrDidSiopAuthenticationRequest,
  IReadQrArgs,
  NavigationBarRoutesEnum,
  QrTypesEnum,
  ScreenRoutesEnum,
  ToastTypeEnum,
} from '../types';
import {OID4VCIMachineInterpreter} from '../types/machines/oid4vci';
import {SiopV2MachineInterpreter} from '../types/machines/siopV2';
import {showToast} from '../utils';
import {authenticate} from './authenticationService';
import {getOrCreatePrimaryIdentifier} from './identityService';

const debug: Debugger = Debug(`${APP_ID}:qrService`);

export const readQr = async (args: IReadQrArgs): Promise<void> => {
  console.log(`args.qrData`, JSON.stringify(args.qrData));
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
    const param: string | null = new URL(qrData).searchParams.get('oob');
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
    return await parseOID4VCI(qrData).catch(error => {
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
      return connectOID4VCI(args);
  }
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

const parseOID4VCI = async (qrData: string): Promise<IQrData> => {
  if (qrData.includes(QrTypesEnum.OPENID_INITIATE_ISSUANCE) || qrData.includes(QrTypesEnum.OPENID_CREDENTIAL_OFFER)) {
    const offerData = convertURIToJsonObject(qrData) as Record<string, unknown>;
    const hasCode = 'code' in offerData && !!offerData.code && !('issuer' in offerData);
    const code = hasCode ? offerData.code : undefined;
    console.log('offer contained code: ', code);

    return Promise.resolve({
      type: qrData.includes(QrTypesEnum.OPENID_INITIATE_ISSUANCE) ? QrTypesEnum.OPENID_INITIATE_ISSUANCE : QrTypesEnum.OPENID_CREDENTIAL_OFFER,
      ...(hasCode && {code}),
      ...(!hasCode && {credentialOffer: await CredentialOfferClient.fromURI(qrData)}),
      uri: qrData,
    });
  }
  throw Error(translate('qr_scanner_qr_not_supported_message'));
};

// TODO remove old flow
const connectDidAuth = async (args: IQrDataArgs): Promise<void> => {
  const identifier: IIdentifier = await getOrCreatePrimaryIdentifier(); // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  const verifier: string = decodeURIComponent(args.qrData.uri.split('?request_uri=')[1]);
  const connection: NonPersistedConnection = {
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
      id: uuidv4(),
    } as DidAuthConfig);
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

export let OID4VCIInstance: OID4VCIMachineInterpreter | undefined;
export let SiopV2Instance: SiopV2MachineInterpreter | undefined;
const connectOID4VCI = async (args: IQrDataArgs): Promise<void> => {
  // console.log(`args.qrData`, JSON.stringify(args.qrData));

  await oid4vciHolderGetMachineInterpreter({
    requestData: args.qrData,
    navigation: oid4vciStateNavigationListener,
  });

  //const xx: OpenID4VCIClientState = {}

  // const xx = {
  //   "credentialIssuer":"https://launchpad.vii.electron.mattrlabs.io",
  //   "credentialOffer":{
  //     "scheme":"openid-credential-offer",
  //     "baseUrl":"openid-credential-offer://",
  //     "credential_offer":{
  //       "credential_issuer":"https://launchpad.vii.electron.mattrlabs.io",
  //       "credentials":[
  //         {
  //           "format":"ldp_vc",
  //           "types":[
  //             "OpenBadgeCredential"
  //           ]
  //         }
  //       ],
  //       "grants":{
  //         "urn:ietf:params:oauth:grant-type:pre-authorized_code":{
  //           "pre-authorized_code":"jQ-m14HCViS2AkbZjr9ut8SpbzHNlwE0gkyXuSCnUrp"
  //         }
  //       }
  //     },
  //     "original_credential_offer":{
  //       "credential_issuer":"https://launchpad.vii.electron.mattrlabs.io",
  //       "credentials":[
  //         {
  //           "format":"ldp_vc",
  //           "types":[
  //             "OpenBadgeCredential"
  //           ]
  //         }
  //       ],
  //       "grants":{
  //         "urn:ietf:params:oauth:grant-type:pre-authorized_code":{
  //           "pre-authorized_code":"jQ-m14HCViS2AkbZjr9ut8SpbzHNlwE0gkyXuSCnUrp"
  //         }
  //       }
  //     },
  //     "supportedFlows":[
  //       "Pre-Authorized Code Flow"
  //     ],
  //     "version":1011,
  //     "preAuthorizedCode":"jQ-m14HCViS2AkbZjr9ut8SpbzHNlwE0gkyXuSCnUrp",
  //     "userPinRequired":false
  //   },
  //   "endpointMetadata":{
  //     "issuer":"https://launchpad.vii.electron.mattrlabs.io",
  //     "token_endpoint":"https://launchpad.vii.electron.mattrlabs.io/oidc/v1/auth/token",
  //     "credential_endpoint":"https://launchpad.vii.electron.mattrlabs.io/oidc/v1/auth/credential",
  //     "authorization_server":"https://launchpad.vii.electron.mattrlabs.io",
  //     "authorization_endpoint":"https://launchpad.vii.electron.mattrlabs.io/oidc/v1/auth/authorize",
  //     "authorizationServerType":"OID4VCI",
  //     "credentialIssuerMetadata":{
  //       "issuer":"https://launchpad.vii.electron.mattrlabs.io",
  //       "authorization_endpoint":"https://launchpad.vii.electron.mattrlabs.io/oidc/v1/auth/authorize",
  //       "token_endpoint":"https://launchpad.vii.electron.mattrlabs.io/oidc/v1/auth/token",
  //       "jwks_uri":"https://launchpad.vii.electron.mattrlabs.io/oidc/v1/auth/jwks",
  //       "token_endpoint_auth_methods_supported":[
  //         "none",
  //         "client_secret_basic",
  //         "client_secret_jwt",
  //         "client_secret_post",
  //         "private_key_jwt"
  //       ],
  //       "code_challenge_methods_supported":[
  //         "S256"
  //       ],
  //       "grant_types_supported":[
  //         "authorization_code",
  //         "urn:ietf:params:oauth:grant-type:pre-authorized_code"
  //       ],
  //       "response_modes_supported":[
  //         "form_post",
  //         "fragment",
  //         "query"
  //       ],
  //       "response_types_supported":[
  //         "code id_token",
  //         "code",
  //         "id_token",
  //         "none"
  //       ],
  //       "scopes_supported":[
  //         "OpenBadgeCredential",
  //         "Passport"
  //       ],
  //       "token_endpoint_auth_signing_alg_values_supported":[
  //         "HS256",
  //         "RS256",
  //         "PS256",
  //         "ES256",
  //         "EdDSA"
  //       ],
  //       "credential_endpoint":"https://launchpad.vii.electron.mattrlabs.io/oidc/v1/auth/credential",
  //       "credentials_supported":[
  //         {
  //           "id":"d2662472-891c-413d-b3c6-e2f0109001c5",
  //           "format":"ldp_vc",
  //           "types":[
  //             "VerifiableCredential",
  //             "OpenBadgeCredential"
  //           ],
  //           "cryptographic_binding_methods_supported":[
  //             "did:key"
  //           ],
  //           "cryptographic_suites_supported":[
  //             "Ed25519Signature2018"
  //           ],
  //           "display":[
  //             {
  //               "name":"Example University Degree",
  //               "description":"JFF Plugfest 3 OpenBadge Credential",
  //               "background_color":"#464c49",
  //               "logo":{
  //
  //               }
  //             }
  //           ]
  //         },
  //         {
  //           "id":"b4c4cdf5-ccc9-4945-8c19-9334558653b2",
  //           "format":"ldp_vc",
  //           "types":[
  //             "VerifiableCredential",
  //             "Passport"
  //           ],
  //           "cryptographic_binding_methods_supported":[
  //             "did:key"
  //           ],
  //           "cryptographic_suites_supported":[
  //             "Ed25519Signature2018"
  //           ],
  //           "display":[
  //             {
  //               "name":"Passport",
  //               "description":"Passport of the Kingdom of Kākāpō",
  //               "background_color":"#171717",
  //               "logo":{
  //                 "url":"https://static.mattr.global/credential-assets/government-of-kakapo/web/logo.svg"
  //               }
  //             }
  //           ]
  //         },
  //         {
  //           "id":"613ecbbb-0a4c-4041-bb78-c64943139d5f",
  //           "format":"jwt_vc_json",
  //           "types":[
  //             "VerifiableCredential",
  //             "OpenBadgeCredential"
  //           ],
  //           "cryptographic_binding_methods_supported":[
  //             "did:key"
  //           ],
  //           "cryptographic_suites_supported":[
  //             "EdDSA"
  //           ],
  //           "display":[
  //             {
  //               "name":"Example University Degree",
  //               "description":"JFF Plugfest 3 OpenBadge Credential",
  //               "background_color":"#464c49",
  //               "logo":{
  //
  //               }
  //             }
  //           ]
  //         },
  //         {
  //           "id":"c3db5513-ae2b-46e9-8a0d-fbfd0ce52b6a",
  //           "format":"jwt_vc_json",
  //           "types":[
  //             "VerifiableCredential",
  //             "Passport"
  //           ],
  //           "cryptographic_binding_methods_supported":[
  //             "did:key"
  //           ],
  //           "cryptographic_suites_supported":[
  //             "EdDSA"
  //           ],
  //           "display":[
  //             {
  //               "name":"Passport",
  //               "description":"Passport of the Kingdom of Kākāpō",
  //               "background_color":"#171717",
  //               "logo":{
  //                 "url":"https://static.mattr.global/credential-assets/government-of-kakapo/web/logo.svg"
  //               }
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   },
  //   "authorizationRequestOpts":{
  //
  //   },
  //   "pkce":{
  //     "disabled":false,
  //     "codeChallengeMethod":"S256"
  //   }
  // }
  // const yy = JSON.stringify({a: 'a'})
  // // @ts-ignore
  // const openID4VCIClient= await OpenID4VCIClient.fromState(yy)

  // const openID4VCIClient= await OpenID4VCIClient.fromURI({
  //   uri: args.qrData.uri,
  //   //authorizationRequest: {redirectUri: `${DefaultURISchemes.CREDENTIAL_OFFER}://`},
  // })
  // console.log('CLIENT CREATED')
  // await openID4VCIClient.exportState()

  // if (args.qrData.code && args.qrData.uri) {
  //   OID4VCIInstance?.send(OID4VCIMachineEvents.PROVIDE_AUTHORIZATION_CODE_RESPONSE, {data: args.qrData.uri});
  //   return;
  // } else {
  //   OID4VCIInstance = OID4VCIMachine.newInstance({requestData: args.qrData});
  //   OID4VCIInstance.start();
  // }
};

const connectSiopV2 = async (args: IQrDataArgs): Promise<void> => {
  SiopV2Instance = SiopV2Machine.newInstance({requestData: args.qrData});
  SiopV2Instance.start();
};
