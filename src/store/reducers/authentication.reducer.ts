import {
  AUTHENTICATE_ENTITY_FAILED,
  AUTHENTICATE_ENTITY_SUCCESS,
  AUTHENTICATE_LOADING,
  AuthenticationActionTypes,
  DISCONNECT_ENTITY_FAILED,
  DISCONNECT_ENTITY_SUCCESS,
  DISCONNECT_LOADING
} from '../../@types/store/authenticate.action.types'
import { IAuthenticatedEntity, IAuthenticationState } from '../../@types/store/authenticate.types'

const initialState: IAuthenticationState = {
  loading: false,
  entities: []
}

const authenticationReducer = (
  state: IAuthenticationState = initialState,
  action: AuthenticationActionTypes
): IAuthenticationState => {
  switch (action.type) {
    case AUTHENTICATE_LOADING: {
      return {
        ...state,
        loading: true
      }
    }
    case AUTHENTICATE_ENTITY_SUCCESS: {
      return {
        ...state,
        entities: [{ ...action.payload }, ...state.entities],
        loading: false
      }
    }
    case AUTHENTICATE_ENTITY_FAILED: {
      return {
        ...state,
        loading: false
      }
    }
    case DISCONNECT_LOADING: {
      return {
        ...state,
        loading: false
      }
    }
    case DISCONNECT_ENTITY_SUCCESS: {
      return {
        ...state,
        entities: [...state.entities].filter(
          (value: IAuthenticatedEntity) => value.entityId !== action.payload.entityId
        ),
        loading: false
      }
    }
    case DISCONNECT_ENTITY_FAILED: {
      return {
        ...state,
        loading: false
      }
    }
    default:
      return state
  }
}

export default authenticationReducer
