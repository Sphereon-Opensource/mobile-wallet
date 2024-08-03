import {VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {emitLinkHandlerURLEvent} from '@sphereon/ssi-sdk.core';
import {ConnectionType, DidAuthConfig, NonPersistedConnection} from '@sphereon/ssi-sdk.data-store';
import {IIdentifier} from '@veramo/core';
import Debug, {Debugger} from 'debug';
import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import {APP_ID} from '../@config/constants';
import {agentContext} from '../agent';
import {translate} from '../localization/Localization';
import {siopGetRequest} from '../providers/authentication/SIOPv2Provider';
import JwtVcPresentationProfileProvider from '../providers/credential/JwtVcPresentationProfileProvider';
import {
  IQrAuthentication,
  IQrData,
  IQrDataArgs,
  IQrDidSiopAuthenticationRequest,
  IReadQrArgs,
  IRequiredContext,
  NavigationBarRoutesEnum,
  QrTypesEnum,
  ScreenRoutesEnum,
  ToastTypeEnum,
} from '../types';
import {showToast} from '../utils';
import {authenticate} from './authenticationService';
import {getOrCreatePrimaryIdentifier} from './identityService';

const debug: Debugger = Debug(`${APP_ID}:qrService`);

export const onQRScanned = async (args: IReadQrArgs): Promise<void> => {
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

  // fixme: We are returning OID4VC for everything, since the linkhandler sort things out itself. To be removed once the old flows in this file are gone
  return {type: QrTypesEnum.OPENID4VC, url: qrData};
};

export const processQr = async (args: IQrDataArgs): Promise<void> => {
  switch (args.qrData.type) {
    case QrTypesEnum.AUTH:
      if ((args.qrData as IQrAuthentication).mode === ConnectionType.SIOPv2) {
        return connectDidAuth(args);
      }
      break;
    case QrTypesEnum.OPENID4VC: // todo: Only OID4VC will be passed no matter the actual protocol. The link handler takes care of everything, should be removed once the old flows are removed here
      return await emitLinkHandlerURLEvent({source: 'QR', url: args.qrData.url}, agentContext);
    default:
      return Promise.reject(Error(translate('qr_scanner_qr_not_supported_message')));
  }
};

// TODO remove old flow
const connectDidAuth = async (args: IQrDataArgs): Promise<void> => {
  const identifier: IIdentifier = await getOrCreatePrimaryIdentifier({}, agentContext); // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
  const verifier: string = decodeURIComponent(args.qrData.uri.split('?request_uri=')[1]);
  const connection: NonPersistedConnection = {
    type: ConnectionType.SIOPv2,
    config: {
      idOpts: {
        identifier,
      },
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
