import {CredentialSupported, EndpointMetadata, EndpointMetadataResult, GrantTypes, MetadataDisplay} from '@sphereon/oid4vci-common';
import {TKeyType} from '@veramo/core';

import {SupportedDidMethodEnum} from '../../did';
import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';

export interface IGetIssuanceInitiationFromUriArgs {
  uri: string;
}

export interface IGetIssuanceInitiationFromIssuerArgs {
  issuer: string;
  clientId: string;
}
export interface IGetCredentialArgs {
  credentialType: string;
  pin?: string;
}

export interface IGetCredentialsArgs {
  grantType: GrantTypes;
  credentials?: Array<string>;
  authenticationOptions?: IAuthenticationOpts;
}

export interface IAuthenticationOpts {
  pin?: string;
  clientId?: string;
  redirectUri?: string;
  code?: string;
  codeVerifier?: string;
  tokenProxyUrl?: string;
}

export type IIssuanceOpts = CredentialSupported & {
  didMethod: SupportedDidMethodEnum;
  keyType: TKeyType;
  authenticationArgs?: IAuthenticationOpts;
};

export interface IGetVcIssuanceFormatArgs {
  credentialSupported: CredentialSupported;
}

/*
export interface IGetIssuanceCryptoSuiteArgs {
  credentialFormatOpts: ICredentialFormatOpts;
}
*/

/*
export interface ICredentialFormatOpts {
  // credentialFormat: CredentialFormatSupport;
  // format: OpenID4VCICredentialFormatTypes;
}
*/

export enum OID4VCIError {
  INVALID_REQUEST = 'invalid_request',
  INVALID_CLIENT = 'invalid_client',
  INVALID_GRANT = 'invalid_grant-vc',
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
  INVALID_SCOPE = 'invalid_scope',
  INVALID_OR_MISSING_PROOF = 'invalid_or_missing_proof',
  VERIFICATION_FAILED = 'verification_failed',
}

export interface IServerMetadataAndCryptoMatchingResponse {
  serverMetadata: EndpointMetadataResult;
  issuanceOpts: Array<IIssuanceOpts>;
  credentialsSupported: Array<CredentialSupported>;
  credentialBranding: Map<string, Array<IBasicCredentialLocaleBranding>>;
  issuerBranding?: Array<MetadataDisplay>;
}
