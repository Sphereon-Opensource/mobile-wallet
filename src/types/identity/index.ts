import {IIdentifier, TKeyType} from '@veramo/core';

import {SupportedDidMethodEnum} from '../did';

export enum KeyManagementSystemEnum {
  LOCAL = 'local',
}

export enum IdentifierAliasEnum {
  PRIMARY = 'primary',
}

export interface IAddIdentifierArgs {
  did: string;
}

export interface ICreateIdentifierArgs {
  method?: SupportedDidMethodEnum;
  createOpts?: ICreateIdentifierOpts;
}

export interface IDispatchIdentifierArgs {
  identifier: IIdentifier;
}

export interface ICreateOrGetIdentifierArgs {
  method?: SupportedDidMethodEnum;
  createOpts?: ICreateIdentifierOpts;
}

export interface ICreateIdentifierOpts {
  kms?: KeyManagementSystemEnum;
  alias?: string;
  options?: IIdentifierProviderOpts;
}

export interface IIdentifierProviderOpts {
  type?: TKeyType;
  use?: string;
  [x: string]: any;
}
