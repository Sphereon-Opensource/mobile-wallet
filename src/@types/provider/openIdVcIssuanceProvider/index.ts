import {
  CredentialFormatSupport,
  CredentialMetadata,
  EndpointMetadata,
  IssuanceInitiationWithBaseUrl,
  OID4VCICredentialFormatTypes
} from '@sphereon/oid4vci-client'
import { CredentialFormat } from '@sphereon/ssi-types'
import { IIdentifier, TKeyType } from '@veramo/core'

import { SupportedDidMethodEnum } from '../../did'

export interface IJwtOpts {
  identifier: IIdentifier
  nonce?: string
}

export interface IGetIssuanceInitiationFromUriArgs {
  uri: string
}

export interface IGetMetaDataArgs {
  issuanceInitiation: IssuanceInitiationWithBaseUrl
}

export interface IGetAccessTokenArgs {
  issuanceInitiation: IssuanceInitiationWithBaseUrl
  pin?: string
  metadata?: EndpointMetadata
}

export interface IGetCredentialArgs {
  issuanceInitiation: IssuanceInitiationWithBaseUrl
  token: string
  format: CredentialFormat | CredentialFormat[]
  jwtOpts: IJwtOpts
  metadata?: EndpointMetadata
}

export interface IGetCredentialFromIssuanceArgs {
  issuanceInitiation: IssuanceInitiationWithBaseUrl
  pin?: string
}

export interface IGetIssuanceOptsArgs {
  credentialType: string
  metadata: EndpointMetadata
}

export interface IIssuanceOpts {
  didMethod: SupportedDidMethodEnum
  format: OID4VCICredentialFormatTypes
  keyType: TKeyType
}

export interface IGetVcIssuanceFormatArgs {
  credentialMetadata: CredentialMetadata
}

export interface IGetIssuanceCryptoSuiteArgs {
  credentialFormatOpts: ICredentialFormatOpts
}

export interface ICredentialFormatOpts {
  credentialFormat: CredentialFormatSupport
  format: OID4VCICredentialFormatTypes
}

export enum Oidc4vciErrorEnum {
  INVALID_REQUEST = 'invalid_request',
  INVALID_CLIENT = 'invalid_client',
  INVALID_GRANT = 'invalid_grant-vc',
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
  INVALID_SCOPE = 'invalid_scope',
  INVALID_OR_MISSING_PROOF = 'invalid_or_missing_proof'
}

export interface IGetSupportedCredentialsArgs {
  metadata: EndpointMetadata
}
