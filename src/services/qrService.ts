import {VerifiedAuthorizationRequest} from '@sphereon/did-auth-siop';
import {convertURIToJsonObject, CredentialOfferClient} from '@sphereon/oid4vci-client';
import {ConnectionTypeEnum, DidAuthConfig, NonPersistedConnection} from '@sphereon/ssi-sdk.data-store';
import {interpreterStartOrResume} from '@sphereon/ssi-sdk.xstate-machine-persistence';
import {IIdentifier} from '@veramo/core';
import Debug, {Debugger} from 'debug';
import {URL} from 'react-native-url-polyfill';
import {v4 as uuidv4} from 'uuid';
import {APP_ID} from '../@config/constants';
import {agentContext, oid4vciHolderGetMachineInterpreter} from '../agent';
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
import {SiopV2MachineInterpreter} from '../types/machines/siopV2';
import {showToast} from '../utils';
import {authenticate} from './authenticationService';
import {getOrCreatePrimaryIdentifier} from './identityService';
import {OID4VCIMachineEvents, OID4VCIMachineInterpreter} from '@sphereon/ssi-sdk.oid4vci-holder';

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

export let oid4vciInstance: OID4VCIMachineInterpreter | undefined;
export let SiopV2Instance: SiopV2MachineInterpreter | undefined;
const connectOID4VCI = async (args: IQrDataArgs): Promise<void> => {
  const oid4vciMachine = await oid4vciHolderGetMachineInterpreter({
    requestData: {
      credentialOffer: args.qrData.credentialOffer,
      uri: args.qrData.uri,
      ...args.qrData,
    },
    stateNavigationListener: oid4vciStateNavigationListener,
  });

  const stateType = args.qrData.code ? 'existing' : 'new';
  const interpreter = oid4vciMachine.interpreter;
  interpreter.onEvent(listener => console.log(`@@ONEVENT: ${JSON.stringify(listener)}`));
  interpreter.onChange((newContext, prevContext) =>
    console.log(`%%ONCHANGE:\n auth response context: ${JSON.stringify(newContext.openID4VCIClientState?.authorizationCodeResponse)}`),
  );
  await interpreterStartOrResume({
    stateType,
    interpreter: oid4vciMachine.interpreter,
    context: agentContext,
    cleanupAllOtherInstances: true,
    cleanupOnFinalState: true,
    singletonCheck: true,
  });
  if (args.qrData.code && args.qrData.uri) {
    // console.log('WAIT 30 SECs')
    // await new Promise((res) => setTimeout(res, 30000))
    console.log('PRE SEND AUT CODE RESPONSE machine event from qrService');
    interpreter.send(OID4VCIMachineEvents.PROVIDE_AUTHORIZATION_CODE_RESPONSE, {data: args.qrData.uri});
    console.log('POST SEND AUT CODE RESPONSE machine event from qrService');
  }
};

const connectSiopV2 = async (args: IQrDataArgs): Promise<void> => {
  SiopV2Instance = SiopV2Machine.newInstance({requestData: args.qrData});
  SiopV2Instance.start();
};
