export const generateDigest = async (data: string, algorithm: string): Promise<Uint8Array> => {
  return new Uint8Array(await crypto.subtle.digest(algorithm, await BufferSourceFrom(data)));
};

export const generateSalt = async (): Promise<string> => {
  return crypto.randomUUID();
};

export const BufferSourceFrom = async (data: string): Promise<BufferSource> => {
  return new TextEncoder().encode(data);
};

export const getCryptoDigestAlgorithm = (algorithm: string): AlgorithmIdentifier => {
  switch (algorithm.toUpperCase()) {
    case 'SHA256':
    case 'SHA-256':
      return 'SHA-256';
    case 'SHA384':
    case 'SHA-384':
      return 'SHA-384';
    case 'SHA512':
    case 'SHA-512':
      return 'SHA-512';
    default:
      throw new Error(`crypto algorithm: ${algorithm} not supported`);
  }
};
