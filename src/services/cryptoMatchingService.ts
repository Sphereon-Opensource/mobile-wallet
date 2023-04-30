import {SupportedDIDMethod, SupportedDidMethodEnum} from '../types';
import {Format, JwtObject} from '@sphereon/pex-models';
import {LdpObject} from '@sphereon/pex-models/model/ldpObject';
import {JsonLdSignatureSuite, LDPProofTypeEnum, SignatureAlgorithmEnum} from '../providers/credential/OpenId4VcIssuanceProvider';

export interface DIDSupport {
  method: SupportedDidMethodEnum;
  keyTypes: KeyType[];
  signatureSuites: JsonLdSignatureSuite[];
}

export type FormatKeyType = 'alg' | 'proof_type';

export interface FormatPreferences {
  type: LDPProofTypeEnum | SignatureAlgorithmEnum;
  key: FormatKeyType;
  didMethods: (SupportedDIDMethod | string)[];
}

export type DIDMethodPrefOrder = SupportedDidMethodEnum[];

export interface DIDFormatSupport {
  didMethod: SupportedDIDMethod | string;
  format: Format;
}

export const Ed25519Signature2018FormatPreferences: FormatPreferences = {
  type: LDPProofTypeEnum.Ed25519Signature2018,
  key: 'proof_type',
  didMethods: ['key', 'jwk'],
};

export const Ed25519Signature2020FormatPreferences: FormatPreferences = {
  type: LDPProofTypeEnum.Ed25519Signature2020,
  key: 'proof_type',
  didMethods: ['key'],
};

export const JsonWebSignature2020FormatPreferences: FormatPreferences = {
  type: LDPProofTypeEnum.JsonWebSignature2020,
  key: 'proof_type',
  didMethods: ['jwk'],
};
export const EcdsaSecp256k1Signature2019FormatPreferences: FormatPreferences = {
  type: LDPProofTypeEnum.EcdsaSecp256k1Signature2019,
  key: 'proof_type',
  didMethods: ['ion', 'key', 'jwk', 'ethr'],
};
export const ES256KFormatPreferences: FormatPreferences = {
  type: SignatureAlgorithmEnum.ES256K,
  key: 'alg',
  didMethods: ['jwk', 'key', 'ion', 'ethr'],
};
export const ES256FormatPreferences: FormatPreferences = {
  type: SignatureAlgorithmEnum.ES256,
  key: 'alg',
  didMethods: ['jwk'],
};

export const EdDSAFormatPreferences: FormatPreferences = {
  type: SignatureAlgorithmEnum.EdDSA,
  key: 'alg',
  didMethods: ['key', 'jwk', 'lto'],
};

export const allFormatPreferences: FormatPreferences[] = [
  ES256KFormatPreferences,
  EdDSAFormatPreferences,
  Ed25519Signature2018FormatPreferences,
  EcdsaSecp256k1Signature2019FormatPreferences,
  JsonWebSignature2020FormatPreferences,
  Ed25519Signature2020FormatPreferences,
  ES256FormatPreferences,
];

export class DIDPreferences {
  private correlationId: string;
  private formatPreferences: FormatPreferences[] = [];
}

export class DIDPreferenceService {
  public fromFormatObject(
    object: LdpObject | JwtObject,
    opts?: {
      formatPreferences?: FormatPreferences[];
      correlationId?: string;
    },
  ): FormatPreferences[] {
    if (opts?.correlationId && Object.keys(wellknownCorrelationIDs).find(key => opts.correlationId?.toLowerCase().includes(key.toLowerCase()))) {
      return this.fromCorrelationId(opts.correlationId, {object, formatPreferences: opts?.formatPreferences});
    }
    const key: FormatKeyType = 'alg' in object ? 'alg' : 'proof_type';
    const types: string[] = 'alg' in object ? object.alg : object.proof_type;
    const formatPreferences = opts?.formatPreferences ?? allFormatPreferences;
    return formatPreferences.filter(pref => pref.key === key && types.includes(pref.type.valueOf()));
  }

  public fromFormat(
    format: Format,
    opts?: {
      formatPreferences?: FormatPreferences[];
      correlationId?: string;
    },
  ): Record<string, FormatPreferences[]> {
    const result: Record<string, FormatPreferences[]> = {};
    for (const [vdmType, value] of Object.entries(format)) {
      result[vdmType] = this.fromFormatObject(value, opts);
    }
    return result;
  }

  private fromCorrelationId(
    correlationId: string,
    opts?: {
      object?: LdpObject | JwtObject;
      formatPreferences?: FormatPreferences[];
    },
  ): FormatPreferences[] {
    const correlationKey = Object.keys(wellknownCorrelationIDs).find(key => correlationId.toLowerCase().includes(key.toLowerCase()));
    if (!correlationKey) {
      if (opts?.object) {
        return this.fromFormatObject(opts?.object, {formatPreferences: opts?.formatPreferences});
      }
      throw Error('Could not retrieve preferences from correlationId nor get generic preferences');
    }
    return wellknownPreferences[wellknownCorrelationIDs[correlationKey]];
  }
}

export const wellknownCorrelationIDs: Record<string, string> = {
  'verifiablecredentials.dev': 'Okta',
};

export const wellknownPreferences: Record<string, FormatPreferences[]> = {
  Okta: [
    {
      type: SignatureAlgorithmEnum.ES256K,
      key: 'alg',
      didMethods: ['key', 'ion', 'ethr', 'web'],
    },
    {
      type: SignatureAlgorithmEnum.EdDSA,
      key: 'alg',
      didMethods: ['key', 'web'],
    },
  ],
};

export const DIDKeyFormatSupport: DIDFormatSupport = {
  didMethod: 'key',
  format: {
    jwt: {
      alg: [SignatureAlgorithmEnum.ES256K, SignatureAlgorithmEnum.EdDSA, SignatureAlgorithmEnum.ES256],
    },
    jwt_vc: {
      alg: [SignatureAlgorithmEnum.ES256K, SignatureAlgorithmEnum.EdDSA, SignatureAlgorithmEnum.ES256],
    },
    jwt_vp: {
      alg: [SignatureAlgorithmEnum.ES256K, SignatureAlgorithmEnum.EdDSA, SignatureAlgorithmEnum.ES256],
    },
    ldp: {
      proof_type: [LDPProofTypeEnum.Ed25519Signature2018, LDPProofTypeEnum.EcdsaSecp256k1Signature2019, LDPProofTypeEnum.Ed25519Signature2020],
    },
    ldp_vc: {
      proof_type: [LDPProofTypeEnum.Ed25519Signature2018, LDPProofTypeEnum.EcdsaSecp256k1Signature2019, LDPProofTypeEnum.Ed25519Signature2020],
    },
    ldp_vp: {
      proof_type: [LDPProofTypeEnum.Ed25519Signature2018, LDPProofTypeEnum.EcdsaSecp256k1Signature2019, LDPProofTypeEnum.Ed25519Signature2020],
    },
  },
};

const didPref = {
  Ed25519Signature2018: {didMethods: [SupportedDidMethodEnum.DID_KEY]},
  EcdsaSecp256k1Signature2019: {didMethods: [SupportedDidMethodEnum.DID_JWK, SupportedDidMethodEnum.DID_ION, SupportedDidMethodEnum.DID_ETHR]},
  Ed25519Signature2020: {didMethods: [SupportedDidMethodEnum.DID_KEY]},
  JsonWebSignature2020: {didMethods: [SupportedDidMethodEnum.DID_JWK]},
};
