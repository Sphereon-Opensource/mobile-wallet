import {WrappedVerifiableCredential, WrappedVerifiablePresentation} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';

export interface IStoreVerifiableCredentialArgs {
  vc: VerifiableCredential;
}

export interface IGetVerifiableCredentialArgs {
  hash: string;
}

export interface IDeleteVerifiableCredentialArgs {
  hash: string;
}

export interface IVerificationResult {
  result: boolean;
  source: WrappedVerifiableCredential | WrappedVerifiablePresentation;
  subResults: IVerificationSubResult[];
  error?: string | undefined;
  errorDetails?: string;
}

export interface IVerificationSubResult {
  result: boolean;
  error?: string;
  errorDetails?: string;
}
