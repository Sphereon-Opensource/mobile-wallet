import crypto from 'crypto';
import {v4 as uuidv4} from 'uuid';

export const generateDigest = (data: string, algorithm: string): Uint8Array => {
  return new Uint8Array(crypto.createHash(getCryptoDigestAlgorithm(algorithm)).update(data).digest());
};

export const generateSalt = (): string => {
  return uuidv4();
};

export const getCryptoDigestAlgorithm = (algorithm: string): string => {
  switch (algorithm.toUpperCase()) {
    case 'SHA256':
    case 'SHA-256':
      return 'sha256';
    case 'SHA384':
    case 'SHA-384':
      return 'sha384';
    case 'SHA512':
    case 'SHA-512':
      return 'sha512';
    default:
      throw new Error(`crypto algorithm: ${algorithm} not supported`);
  }
};
