import {
  ConnectionActionTypes,
  CONNECTIONS_LOADING,
  GET_CONNECTION_ENTITIES_FAILED,
  GET_CONNECTION_ENTITIES_SUCCESS
} from '../../types/store/connection.action.types'
import { IConnectionState } from '../../types/store/connection.types'

const initialState: IConnectionState = {
  loading: false,
  parties: [],
  error: null
}

const connectionReducer = (state: IConnectionState = initialState, action: ConnectionActionTypes): IConnectionState => {
  switch (action.type) {
    case CONNECTIONS_LOADING: {
      return {
        ...state,
        loading: true,
        error: null
      }
    }
    case GET_CONNECTION_ENTITIES_SUCCESS: {
      return {
        ...state,
        parties: [...action.payload],
        error: null,
        loading: false
      }
    }
    case GET_CONNECTION_ENTITIES_FAILED: {
      return {
        ...state,
        loading: false,
        error: action.error
      }
    }
    default:
      return state
  }
}

export default connectionReducer
