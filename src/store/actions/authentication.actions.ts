import { ConnectionTypeEnum, IConnection } from '@sphereon/ssi-sdk-data-store-common'
import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

import { authenticate, disconnect } from '../../services/authenticationService'
import { CustomApprovalEnum, RootState } from '../../types'
import {
  AUTHENTICATE_ENTITY_FAILED,
  AUTHENTICATE_ENTITY_SUCCESS,
  AUTHENTICATE_LOADING,
  DISCONNECT_ENTITY_FAILED,
  DISCONNECT_ENTITY_SUCCESS,
  DISCONNECT_LOADING
} from '../../types/store/authenticate.action.types'
import { IAuthentication } from '../../types/store/authenticate.types'

export const authenticateConnectionEntity = (
  entityId: string,
  connection: IConnection
): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: AUTHENTICATE_LOADING })
    return authenticate(connection)
      .then((authentication: IAuthentication) => {
        const payload = {
          entityId,
          connectionType: connection.type,
          authentication
        }
        dispatch({ type: AUTHENTICATE_ENTITY_SUCCESS, payload })
      })
      .catch((error: unknown) => {
        dispatch({ type: AUTHENTICATE_ENTITY_FAILED })
        return Promise.reject(error)
      })
  }
}

export const disconnectConnectionEntity = (
  entityId: string,
  connection: IConnection
): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: DISCONNECT_LOADING })
    return disconnect(entityId, connection)
      .then(() => {
        const payload = { entityId }
        dispatch({ type: DISCONNECT_ENTITY_SUCCESS, payload })
      })
      .catch((error: Error) => {
        dispatch({ type: DISCONNECT_ENTITY_FAILED })
        return Promise.reject(error)
      })
  }
}
