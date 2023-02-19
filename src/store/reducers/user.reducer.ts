import {
  GET_USER_FAILED,
  GET_USER_SUCCESS,
  UserActionTypes,
  USERS_LOADING
} from '../../@types/store/user.action.types'
import { IUserState } from '../../@types/store/user.types'

const initialState: IUserState = {
  loading: false,
  user: undefined
}

const userReducer = (state: IUserState = initialState, action: UserActionTypes): IUserState => {
  switch (action.type) {
    case USERS_LOADING: {
      return {
        ...state,
        loading: true
      }
    }
    case GET_USER_SUCCESS: {
      return {
        ...state,
        user: action.payload,
        loading: false
      }
    }
    case GET_USER_FAILED: {
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
