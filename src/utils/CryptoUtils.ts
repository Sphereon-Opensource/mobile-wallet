import {CryptoDigestAlgorithm, digest, randomUUID} from 'expo-crypto';

export const generateDigest = async (data: string, algorithm: string): Promise<Uint8Array> => {
  const cryptoDigestAlgorithm = getCryptoDigestAlgorithm(algorithm);
  const bufferSource = await BufferSourceFrom(data);

  return new Uint8Array(await digest(cryptoDigestAlgorithm, bufferSource));
};

export const generateSalt = async (): Promise<string> => {
  return randomUUID();
};

export const BufferSourceFrom = async (data: string): Promise<BufferSource> => {
  return new TextEncoder().encode(data);
};

export const getCryptoDigestAlgorithm = (algorithm: string): CryptoDigestAlgorithm => {
  switch (algorithm.toUpperCase()) {
    case 'SHA-256':
      return CryptoDigestAlgorithm.SHA256;
    case 'SHA1':
      return CryptoDigestAlgorithm.SHA1;
    case 'SHA384':
      return CryptoDigestAlgorithm.SHA384;
    case 'SHA512':
      return CryptoDigestAlgorithm.SHA512;
    case 'MD2':
      return CryptoDigestAlgorithm.MD2;
    case 'MD4':
      return CryptoDigestAlgorithm.MD4;
    case 'MD5':
      return CryptoDigestAlgorithm.MD5;
    default:
      throw new Error(`crypto algorithm: ${algorithm} not supported`);
  }
};
