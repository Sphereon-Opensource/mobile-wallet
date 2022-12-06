import { ConnectionTypeEnum, IConnection } from '@sphereon/ssi-sdk-data-store-common'
import { Dispatch } from 'react'
import { AnyAction } from 'redux'

import { CustomApprovalEnum } from '../../@types'
import {
  AUTHENTICATE_ENTITY_FAILED,
  AUTHENTICATE_ENTITY_SUCCESS,
  AUTHENTICATE_LOADING,
  DISCONNECT_ENTITY_FAILED,
  DISCONNECT_ENTITY_SUCCESS,
  DISCONNECT_LOADING
} from '../../@types/store/authenticate.action.types'
import { IAuthentication } from '../../@types/store/authenticate.types'
import { authenticate, disconnect } from '../../services/authenticationService'

export const authenticateConnectionEntity = (
  entityId: string,
  connection: IConnection
): ((dispatch: Dispatch<AnyAction>) => void) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: AUTHENTICATE_LOADING })
    return authenticate(connection, connection.type === ConnectionTypeEnum.DIDAUTH ? CustomApprovalEnum.PEX : undefined)
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
): ((dispatch: Dispatch<AnyAction>) => void) => {
  return (dispatch: any) => {
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
