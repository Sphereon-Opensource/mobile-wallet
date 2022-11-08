import { SET_USER, UserActionTypes } from '../types/user.action.types'
import { IUserState } from '../types/user.types'

const initialState: IUserState = {
  name: null
}

const userReducer = (state: IUserState = initialState, action: UserActionTypes): IUserState => {
  switch (action.type) {
    case SET_USER: {
      return {
        ...state,
        name: action.payload.name
      }
    }
    default:
      return state
  }
}

export default userReducer
