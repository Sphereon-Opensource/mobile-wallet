import { IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'
import Debug from 'debug'
import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

import { APP_ID } from '../../@config/constants'
import { getConnectionParties as getConnections } from '../../services/connectionService'
import { RootState } from '../../types'
import {
  CONNECTIONS_LOADING,
  GET_CONNECTION_ENTITIES_FAILED,
  GET_CONNECTION_ENTITIES_SUCCESS
} from '../../types/store/connection.action.types'

const debug = Debug(`${APP_ID}:connectionService`)

export const getConnectionParties = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  debug('dispatchConnectionParties()...')
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    debug(CONNECTIONS_LOADING)
    dispatch({ type: CONNECTIONS_LOADING })
    getConnections()
      .then((entities: Array<IConnectionParty>) => {
        debug(GET_CONNECTION_ENTITIES_SUCCESS)
        dispatch({ type: GET_CONNECTION_ENTITIES_SUCCESS, payload: entities })
      })
      .catch((reason) => {
        debug(`GET_CONNECTION_ENTITIES_FAILED, ${reason}`)
        dispatch({ type: GET_CONNECTION_ENTITIES_FAILED, reason })
      })
  }
}
