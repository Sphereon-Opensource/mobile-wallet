import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

import { IUser, RootState } from '../../@types'
import {
  GET_USER_FAILED,
  GET_USER_SUCCESS,
  USERS_LOADING
} from '../../@types/store/user.action.types'
import { createUser as addUserToStorage, getUser as getUserFromStorage } from '../../services/userService'

export const createUser = (args: Omit<IUser, 'id'>): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  // this action is implemented with the idea that when we create users, we also need to keep track of them in redux. So that we can easily switch between them if we want to (not yet implemented)
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: USERS_LOADING })
    addUserToStorage(args)
      .then((user: IUser) => {
        // Dispatching GET_USER_SUCCESS as well to immediately set the user and make it navigate to the main stack.
        // This will change in the future where we want to create a user before navigating
        dispatch({ type: GET_USER_SUCCESS, payload: user })
      })
    .catch(() => dispatch({ type: GET_USER_FAILED }))
  }
}

export const getUser = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: USERS_LOADING })
    getUserFromStorage()
      .then((user: IUser) => {
        dispatch({ type: GET_USER_SUCCESS, payload: user })
      })
      .catch(() => dispatch({ type: GET_USER_FAILED }))
  }
}
