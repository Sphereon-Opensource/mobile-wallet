import {JWK} from '@sphereon/ssi-types';
import agent from '../agent';

export const verifySDJWTSignature = async <T>(data: string, signature: string, key: JsonWebKey): Promise<Awaited<Promise<boolean>>> => {
  const result = await agent.jwtVerifyJwsSignature({jws: `${data}.${signature}`, jwk: key as JWK});
  return !result.error;
};
