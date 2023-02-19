import { IAuthenticatedEntity, IDisconnectConnectionPayload } from './authenticate.types'

export const AUTHENTICATE_LOADING = '[AUTHENTICATION] AUTHENTICATE_LOADING'
export type AUTHENTICATE_LOADING = typeof AUTHENTICATE_LOADING
export const AUTHENTICATE_ENTITY_SUCCESS = '[AUTHENTICATION] AUTHENTICATE_ENTITY_SUCCESS'
export type AUTHENTICATE_ENTITY_SUCCESS = typeof AUTHENTICATE_ENTITY_SUCCESS
export const AUTHENTICATE_ENTITY_FAILED = '[AUTHENTICATION] AUTHENTICATE_ENTITY_FAILED'
export type AUTHENTICATE_ENTITY_FAILED = typeof AUTHENTICATE_ENTITY_FAILED
export const DISCONNECT_LOADING = '[AUTHENTICATION] DISCONNECT_LOADING'
export type DISCONNECT_LOADING = typeof DISCONNECT_LOADING
export const DISCONNECT_ENTITY_SUCCESS = '[AUTHENTICATION] DISCONNECT_ENTITY_SUCCESS'
export type DISCONNECT_ENTITY_SUCCESS = typeof DISCONNECT_ENTITY_SUCCESS
export const DISCONNECT_ENTITY_FAILED = '[AUTHENTICATION] DISCONNECT_ENTITY_FAILED'
export type DISCONNECT_ENTITY_FAILED = typeof DISCONNECT_ENTITY_FAILED

interface IAuthenticateLoading {
  type: AUTHENTICATE_LOADING
}

interface IAuthenticateConnectionSuccessAction {
  type: AUTHENTICATE_ENTITY_SUCCESS
  payload: IAuthenticatedEntity
}

interface IAuthenticateConnectionFailedAction {
  type: AUTHENTICATE_ENTITY_FAILED
}

interface IDisconnectLoading {
  type: DISCONNECT_LOADING
}

interface IDisconnectConnectionSuccessAction {
  type: DISCONNECT_ENTITY_SUCCESS
  payload: IDisconnectConnectionPayload
}

interface IDisconnectConnectionFailedAction {
  type: DISCONNECT_ENTITY_FAILED
}

export type AuthenticationActionTypes =
  | IAuthenticateLoading
  | IAuthenticateConnectionSuccessAction
  | IAuthenticateConnectionFailedAction
  | IDisconnectLoading
  | IDisconnectConnectionSuccessAction
  | IDisconnectConnectionFailedAction
