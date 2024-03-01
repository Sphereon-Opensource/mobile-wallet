import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import Debug, {Debugger} from 'debug';
import {IIdentifier} from '@veramo/core';
import {VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {CredentialOfferClient} from '@sphereon/oid4vci-client';
import {ConnectionTypeEnum, NonPersistedConnection, DidAuthConfig} from '@sphereon/ssi-sdk.data-store';
import {APP_ID} from '../@config/constants';
import {translate} from '../localization/Localization';
import {siopGetRequest} from '../providers/authentication/SIOPv2Provider';
import JwtVcPresentationProfileProvider from '../providers/credential/JwtVcPresentationProfileProvider';
import {OID4VCIMachine} from '../machines/oid4vciMachine';
import {authenticate, issuerConnectionFromURI} from './authenticationService';
import {getOrCreatePrimaryIdentifier} from './identityService';
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
import {OID4VCIMachineInterpreter} from '../types/machines/oid4vci';
import {SiopV2MachineInterpreter} from '../types/machines/siopV2';
import {SiopV2Machine} from '../machines/siopV2Machine';

const debug: Debugger = Debug(`${APP_ID}:qrService`);

export let OID4VCIInstance: OID4VCIMachineInterpreter | undefined;

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

  if (
    qrData.startsWith(QrTypesEnum.OPENID_INITIATE_ISSUANCE) ||
    qrData.startsWith(QrTypesEnum.OPENID_CREDENTIAL_OFFER) ||
    qrData.startsWith(QrTypesEnum.OPENID_CONNECT_ISSUER)
  ) {
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
  console.log(`QR DATA: ${JSON.stringify(args.qrData)}`);
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
    case QrTypesEnum.OPENID_CONNECT_ISSUER:
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
  if (qrData.includes(QrTypesEnum.OPENID_INITIATE_ISSUANCE)) {
    return Promise.resolve({
      type: QrTypesEnum.OPENID_INITIATE_ISSUANCE,
      credentialOffer: await CredentialOfferClient.fromURI(qrData),
      uri: qrData,
    });
  } else if (qrData.includes(QrTypesEnum.OPENID_CONNECT_ISSUER)) {
    return Promise.resolve({
      type: QrTypesEnum.OPENID_CONNECT_ISSUER,
      issuerConnection: issuerConnectionFromURI(qrData),
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

const connectOID4VCI = async (args: IQrDataArgs): Promise<void> => {
  OID4VCIInstance = OID4VCIMachine.newInstance({requestData: args.qrData});
  OID4VCIInstance.start();
};

const connectSiopV2 = async (args: IQrDataArgs): Promise<void> => {
  const SiopV2Instance: SiopV2MachineInterpreter = SiopV2Machine.newInstance({requestData: args.qrData});
  SiopV2Instance.start();
};
