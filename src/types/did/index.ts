import {DID_PREFIX} from '../../@config/constants';

export enum SupportedDidMethodEnum {
  DID_ETHR = 'ethr',
  DID_KEY = 'key',
  DID_LTO = 'lto',
  DID_ION = 'ion',
  DID_FACTOM = 'factom',
  DID_JWK = 'jwk',
  DID_OYD = 'oyd',
}

export const DEFAULT_DID_METHOD = SupportedDidMethodEnum.DID_JWK;
export const DEFAULT_DID_PREFIX_AND_METHOD = `${DID_PREFIX}:${DEFAULT_DID_METHOD}`;
export type SupportedDIDMethod = 'oyd' | 'ethr' | 'key' | 'lto' | 'ion' | 'jwk';
