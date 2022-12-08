import { IBasicConnection } from '@sphereon/ssi-sdk-data-store-common'

export interface ICreateContactArgs {
  name: string
  alias: string
  uri: string
}

export interface IAddConnectionArgs {
  contactId: string
  connection: IBasicConnection
}
