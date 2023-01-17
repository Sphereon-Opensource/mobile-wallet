import { FindPartyArgs } from '@sphereon/ssi-sdk-connection-manager'
import { IBasicConnection } from '@sphereon/ssi-sdk-data-store-common'

export interface ICreateContactArgs {
  name: string
  alias: string
  uri?: string
}

export interface IAddIdentityArgs {
  contactId: string
  connection: IBasicConnection
}

export interface IGetContactsArgs {
  filter?: FindPartyArgs
}
