import crypto from 'crypto';
import {v4 as uuidv4} from 'uuid';

export const generateDigest = (data: string, algorithm: string): Uint8Array => {
  return new Uint8Array(crypto.createHash(algorithm).update(data).digest());
};

export const generateSalt = (): string => {
  return uuidv4();
};
