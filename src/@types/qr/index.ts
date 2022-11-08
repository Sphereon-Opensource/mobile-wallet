export enum QrTypesEnum {
  AUTH = 'auth',
  SIOPV2 = 'siopv2',
  OPENID_VC = 'openid-vc',
  OPENID_INITIATE_ISSUANCE = 'openid-initiate-issuance'
}

export interface IQrData {
  type: QrTypesEnum
  [x: string]: any
}

export interface IQrAuthentication extends IQrData {
  mode: string
}

export interface IQrDidSiopAuthenticationRequest extends IQrAuthentication {
  state: string
  did: string
  redirectUrl: string
}
