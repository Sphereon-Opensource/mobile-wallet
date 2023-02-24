import { IUser } from '../../types'
import {
  CREATE_USER_FAILED,
  CREATE_USER_SUCCESS,
  GET_USERS_FAILED,
  GET_USERS_SUCCESS,
  SET_ACTIVE_USER_FAILED,
  SET_ACTIVE_USER_SUCCESS,
  UserActionTypes,
  USERS_LOADING
} from '../../types/store/user.action.types'
import { IUserState } from '../../types/store/user.types'

const initialState: IUserState = {
  loading: false,
  users: new Map<string, IUser>(),
  activeUser: undefined
}

const userReducer = (state: IUserState = initialState, action: UserActionTypes): IUserState => {
  switch (action.type) {
    case USERS_LOADING: {
      return {
        ...state,
        loading: true
      }
    }
    case CREATE_USER_SUCCESS: {
      return {
        ...state,
        users: state.users.set(action.payload.id, action.payload),
        loading: false
      }
    }
    case CREATE_USER_FAILED: {
      return {
        ...state,
        loading: false
      }
    }
    case GET_USERS_SUCCESS: {
      return {
        ...state,
        users: action.payload,
        loading: false
      }
    }
    case GET_USERS_FAILED: {
      return {
        ...state,
        loading: false
      }
    }
    case SET_ACTIVE_USER_SUCCESS: {
      return {
        ...state,
        activeUser: action.payload,
        loading: false
      }
    }
    case SET_ACTIVE_USER_FAILED: {
      return {
        ...state,
        loading: false
      }
    }
    default:
      return state
  }
}

export default userReducer
