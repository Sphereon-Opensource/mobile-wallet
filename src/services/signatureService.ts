import {IIdentifier} from '@veramo/core';
import {createJWT, Signer} from 'did-jwt';
import agent from '../agent';
import {signatureAlgorithmFromKey} from '../utils';
import {ISignJwtArgs} from '../types';

export const signJWT = async (args: ISignJwtArgs): Promise<string> => {
  const options = {
    ...args.options,
    signer: getSigner(args.identifier),
  };

  return createJWT(args.payload, options, args.header);
};

const getSigner = (identifier: IIdentifier): Signer => {
  // TODO currently we assume an identifier only has one key
  const key = identifier.keys[0];
  // TODO See if this is mandatory for a correct JWT
  const algorithm = signatureAlgorithmFromKey(key);

  return async (data: string | Uint8Array): Promise<string> => {
    const input = data instanceof Object.getPrototypeOf(Uint8Array) ? new TextDecoder().decode(data as Uint8Array) : (data as string);

    return await agent.keyManagerSign({
      keyRef: key.kid,
      algorithm,
      data: input,
    });
  };
};

export const verifySDJWTSignature = async <T>(data: string, signature: string, key: JsonWebKey): Promise<Awaited<Promise<boolean>>> => {
  let {alg, crv} = key;
  if (alg === 'ES256') alg = 'ECDSA';
  const publicKey = await crypto.subtle.importKey('jwk', key, {name: alg, namedCurve: crv} as EcKeyImportParams, true, ['verify']);

  return Promise.resolve(
    crypto.subtle.verify({name: alg as string, hash: 'SHA-256'}, publicKey, Buffer.from(signature, 'base64'), Buffer.from(data)),
  );
};
