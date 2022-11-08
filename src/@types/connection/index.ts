import { IConnection } from '@sphereon/ssi-sdk-data-store-common'

export enum ConnectionStatusEnum {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

export interface IConnectionViewItem {
  entityId?: string
  entityName: string
  connection: IConnection
  connectionStatus: ConnectionStatusEnum // TODO i do not want to supply this but base it on the auth entities
}
