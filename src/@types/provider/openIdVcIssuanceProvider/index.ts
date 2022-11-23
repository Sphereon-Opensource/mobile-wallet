import {
  CredentialFormatSupport,
  CredentialMetadata,
  EndpointMetadata,
  IssuanceInitiationWithBaseUrl,
  OpenID4VCICredentialFormatTypes,
} from '@sphereon/openid4vci-client'
import {IIdentifier, TKeyType} from '@veramo/core'

import {SupportedDidMethodEnum} from '../../did'

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
  credentialType: string
  pin?: string
}

export interface IGetCredentialsArgs {
  pin?: string
}

export interface IIssuanceOpts {
  didMethod: SupportedDidMethodEnum
  format: OpenID4VCICredentialFormatTypes
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
  format: OpenID4VCICredentialFormatTypes
}
