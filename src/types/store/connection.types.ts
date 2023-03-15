import { IContact } from '@sphereon/ssi-sdk-data-store'

export interface IConnectionState {
  loading: boolean
  parties: Array<IContact>
  error: Error | null
}
