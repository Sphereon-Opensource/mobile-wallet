import {CredentialRole, WrappedVerifiableCredential, WrappedVerifiablePresentation} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';
import {CredentialCorrelationType} from '@sphereon/ssi-sdk.data-store-types';

export interface IStoreVerifiableCredentialArgs {
  vc: VerifiableCredential | string;
  credentialRole: CredentialRole;
  issuerCorrelationId: string;
  issuerCorrelationType: CredentialCorrelationType;
  kmsKeyRef?: string;
}

export interface IGetVerifiableCredentialArgs {
  hash: string;
  credentialRole: CredentialRole;
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
