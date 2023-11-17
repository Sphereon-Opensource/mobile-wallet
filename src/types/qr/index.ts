import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export enum QrTypesEnum {
  AUTH = 'auth',
  SIOPV2 = 'siopv2',
  OPENID_VC = 'openid-vc',
  OPENID4VC = 'openid4vc',
  OPENID = 'openid',
  OPENID_INITIATE_ISSUANCE = 'openid-initiate-issuance',
  OPENID_CREDENTIAL_OFFER = 'openid-credential-offer',
}

export interface IQrData {
  type: QrTypesEnum;
  [x: string]: any;
}

export interface IQrAuthentication extends IQrData {
  mode: string;
}

export interface IQrDidSiopAuthenticationRequest extends IQrAuthentication {
  state: string;
  did: string;
  redirectUrl: string;
}

export interface IQrDataArgs {
  qrData: IQrData;
  navigation: NativeStackNavigationProp<any>; // TODO fix any
}

export interface IReadQrArgs {
  qrData: string;
  navigation: NativeStackNavigationProp<any>; // TODO fix any
}
