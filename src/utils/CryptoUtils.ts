import {shaHasher} from '@sphereon/ssi-sdk.core';
import {Hasher, HasherSync} from '@sphereon/ssi-types';
import {v4 as uuidv4} from 'uuid';

export const generateDigest: HasherSync = (data: string, algorithm: string): Uint8Array => {
  return shaHasher(data, algorithm);
};

export const generateSalt = (): string => {
  return uuidv4();
};
