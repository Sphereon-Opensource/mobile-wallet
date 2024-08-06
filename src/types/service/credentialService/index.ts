import {WrappedVerifiableCredential, WrappedVerifiablePresentation} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';
import {CredentialCorrelationType} from '@sphereon/ssi-sdk.data-store';
import {CredentialRole} from '@sphereon/ssi-sdk.data-store';

export interface IStoreVerifiableCredentialArgs {
  vc: VerifiableCredential;
  credentialRole: CredentialRole;
  issuerCorrelationId: string;
  issuerCorrelationType: CredentialCorrelationType;
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
