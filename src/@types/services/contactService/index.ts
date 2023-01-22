import { FindPartyArgs } from '@sphereon/ssi-sdk-connection-manager'
import { BasicPartyIdentifier, IBasicConnection } from '@sphereon/ssi-sdk-data-store-common'

export interface ICreateContactArgs {
  name: string
  alias: string
  identifier: BasicPartyIdentifier
  uri?: string
}

export interface IAddIdentityArgs {
  contactId: string
  connection: IBasicConnection
}

export interface IGetContactsArgs {
  filter?: FindPartyArgs
}
