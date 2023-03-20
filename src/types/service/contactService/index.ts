import {
  FindContactArgs,
  IBasicIdentity
} from '@sphereon/ssi-sdk-data-store'

export interface ICreateContactArgs {
  name: string
  alias: string
  uri?: string
  identities?: Array<IBasicIdentity>
}

export interface IAddIdentityArgs {
  contactId: string
  identity: IBasicIdentity
}

export interface IGetContactsArgs {
  filter?: FindContactArgs
}
