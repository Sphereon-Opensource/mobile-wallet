import {URL} from 'react-native-url-polyfill';
import {Subscription} from 'xstate';
import {v4 as uuidv4} from 'uuid';
import Debug, {Debugger} from 'debug';
import {IIdentifier, VerifiableCredential} from '@veramo/core';
import {PresentationDefinitionWithLocation, RPRegistrationMetadataPayload, VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {CredentialOfferClient} from '@sphereon/oid4vci-client';
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
import {OriginalVerifiableCredential, W3CVerifiableCredential} from '@sphereon/ssi-types';
import {APP_ID} from '../@config/constants';
import {translate} from '../localization/Localization';
import {siopGetRequest, siopSendAuthorizationResponse} from '../providers/authentication/SIOPv2Provider';
import JwtVcPresentationProfileProvider from '../providers/credential/JwtVcPresentationProfileProvider';
import {OID4VCIMachine} from '../machines/oid4vciMachine';
import store from '../store';
import {addIdentity} from '../store/actions/contact.actions';
import {oid4vciStateNavigationListener} from '../navigation/machines/oid4vciStateNavigation';
import {authenticate} from './authenticationService';
import {getContacts} from './contactService';
import {getOrCreatePrimaryIdentifier} from './identityService';
import {delay} from '../utils/AppUtils';
import {translateCorrelationIdToName} from '../utils/CredentialUtils';
import {filterNavigationStack} from '../utils/NavigationUtils';
import {showToast} from '../utils/ToastUtils';
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
import {OID4VCIMachineInterpreter, OID4VCIMachineState} from '../types/machines/oid4vci';

const debug: Debugger = Debug(`${APP_ID}:qrService`);

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
      return connectOID4VCIssuance(args);
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

// TODO remove old flow
const connectDidAuth = async (args: IQrDataArgs): Promise<void> => {
  const identifier: IIdentifier = await getOrCreatePrimaryIdentifier(); // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  const verifier: string = decodeURIComponent(args.qrData.uri.split('?request_uri=')[1]);
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
      id: uuidv4(),
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

const connectOID4VCIssuance = async (args: IQrDataArgs): Promise<void> => {
  const OID4VCIInstance: OID4VCIMachineInterpreter = OID4VCIMachine.newInstance({requestData: args.qrData});
  const subscription: Subscription = OID4VCIInstance.subscribe((state: OID4VCIMachineState) =>
    oid4vciStateNavigationListener(OID4VCIInstance, state),
  );
  OID4VCIInstance.start();
  subscription.unsubscribe();
};
