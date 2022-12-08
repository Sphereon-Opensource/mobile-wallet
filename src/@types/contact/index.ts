import { IConnectionViewItem } from '../connection'

export interface IContact {
  id: string
  name: string
  alias: string
  uri: string
  role: string
  connections: Array<IConnectionViewItem>
}

