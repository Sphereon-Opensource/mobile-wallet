import {IKey, TKeyType} from '@veramo/core';

import {SignatureAlgorithmEnum} from '../providers/credential/OpenId4VcIssuanceProvider';

export const SignatureAlgorithmFromKeyType = (type: TKeyType) => {
  switch (type) {
    case 'Ed25519':
    case 'X25519':
      return SignatureAlgorithmEnum.EdDSA;
    case 'Secp256r1':
      return SignatureAlgorithmEnum.ES256;
    case 'Secp256k1':
      return SignatureAlgorithmEnum.ES256K;
    default:
      throw new Error(`Key type '${type}' not supported`);
  }
};

export const SignatureAlgorithmFromKey = (key: IKey) => {
  return SignatureAlgorithmFromKeyType(key.type);
};

// TODO improve this conversion for jwt and jsonld, not a fan of current structure
export const KeyTypeFromCryptographicSuite = (suite: string): TKeyType => {
  switch (suite) {
    case 'EdDSA':
    case 'Ed25519Signature2018':
    case 'Ed25519Signature2020':
    case 'JcsEd25519Signature2020':
      return 'Ed25519';
    case 'JsonWebSignature2020':
    case 'ES256':
      return 'Secp256r1';
    case 'EcdsaSecp256k1Signature2019':
    case 'ES256K':
      return 'Secp256k1';
    default:
      throw new Error(`Cryptographic suite '${suite}' not supported`);
  }
};
