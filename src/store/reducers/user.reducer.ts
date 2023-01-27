import { SET_USER, UserActionTypes } from '../../@types/store/user.action.types'
import { IUserState } from '../../@types/store/user.types'

const initialState: IUserState = {
  name: undefined
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
