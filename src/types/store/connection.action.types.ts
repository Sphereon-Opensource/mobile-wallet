import { IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'

export const CONNECTIONS_LOADING = '[CONNECTION] CONNECTIONS_LOADING'
export type CONNECTIONS_LOADING = typeof CONNECTIONS_LOADING
export const GET_CONNECTION_ENTITIES_SUCCESS = '[CONNECTION] GET_CONNECTION_ENTITIES_SUCCESS'
export type GET_CONNECTION_ENTITIES_SUCCESS = typeof GET_CONNECTION_ENTITIES_SUCCESS
export const GET_CONNECTION_ENTITIES_FAILED = '[CONNECTION] GET_CONNECTION_ENTITIES_FAILED'
export type GET_CONNECTION_ENTITIES_FAILED = typeof GET_CONNECTION_ENTITIES_FAILED

interface IConnectionsLoading {
  type: CONNECTIONS_LOADING
}

interface IGetConnectionEntitiesSuccessAction {
  type: GET_CONNECTION_ENTITIES_SUCCESS
  payload: Array<IConnectionParty>
}

interface IGetConnectionEntitiesFailedAction {
  type: GET_CONNECTION_ENTITIES_FAILED
  error: Error
}

export type ConnectionActionTypes =
  | IConnectionsLoading
  | IGetConnectionEntitiesSuccessAction
  | IGetConnectionEntitiesFailedAction
