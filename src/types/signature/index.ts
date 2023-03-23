import {IIdentifier} from '@veramo/core';
import {JWTHeader, JWTPayload} from 'did-jwt';

export interface ISignJwtArgs {
  identifier: IIdentifier;
  header: Partial<JWTHeader>;
  payload: Partial<JWTPayload>;
  options: {issuer: string; expiresIn?: number; canonicalize?: boolean};
}
