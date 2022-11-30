import { IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'
import Debug from 'debug'
import { Dispatch } from 'react'
import { AnyAction } from 'redux'

import { APP_ID } from '../../@config/constants'
import {
  CONNECTIONS_LOADING,
  GET_CONNECTION_ENTITIES_FAILED,
  GET_CONNECTION_ENTITIES_SUCCESS
} from '../../@types/store/connection.action.types'
import { getConnectionParties as getConnections } from '../../services/connectionService'

const debug = Debug(`${APP_ID}:connectionService`)

export const getConnectionParties = () => {
  debug('dispatchConnectionParties()...')
  return (dispatch: Dispatch<AnyAction>) => {
    debug(CONNECTIONS_LOADING)
    dispatch({ type: CONNECTIONS_LOADING })
    getConnections()
      .then((entities: Array<IConnectionParty>) => {
        const payload = [...entities]
        debug(GET_CONNECTION_ENTITIES_SUCCESS)
        dispatch({ type: GET_CONNECTION_ENTITIES_SUCCESS, payload })
      })
      .catch((reason) => {
        debug(`GET_CONNECTION_ENTITIES_FAILED, ${reason}`)
        dispatch({ type: GET_CONNECTION_ENTITIES_FAILED, reason })
      })
  }
}
