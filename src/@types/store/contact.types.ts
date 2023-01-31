import { IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'

export interface IContactState {
  loading: boolean
  contacts: Array<IConnectionParty>
}
