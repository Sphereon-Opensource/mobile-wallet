import { IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'

export interface IConnectionState {
  loading: boolean
  parties: Array<IConnectionParty>
  error: Error | null
}
