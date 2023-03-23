import { IIdentifier, TKeyType } from '@veramo/core'

import { SupportedDidMethodEnum } from '../did'

export enum KeyManagementSystemEnum {
  LOCAL = 'local'
}

export enum IdentifierAliasEnum {
  PRIMARY = 'primary'
}

export enum SignatureAlgorithmEnum {
  EdDSA = 'EdDSA',
  ES256 = 'ES256',
  ES256K = 'ES256K'
}

export interface IAddIdentifierArgs {
  did: string
}

export interface ICreateIdentifierArgs {
  method: SupportedDidMethodEnum
  createOpts?: ICreateIdentifierOpts
}

export interface ICreateOrGetIdentifierArgs {
  method: SupportedDidMethodEnum
  createOpts?: ICreateIdentifierOpts
}

export interface ICreateIdentifierOpts {
  kms?: KeyManagementSystemEnum
  alias?: string
  options?: IIdentifierProviderOpts
}

export interface IIdentifierProviderOpts {
  type?: TKeyType
  use?: string
  [x: string]: any
}
