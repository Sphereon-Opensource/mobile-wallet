import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

import { createUser as addUserToStorage, getUsers as getUsersFromStorage } from '../../services/userService'
import { IUser, RootState } from '../../types'
import {
  CREATE_USER_FAILED,
  CREATE_USER_SUCCESS,
  GET_USERS_FAILED,
  GET_USERS_SUCCESS,
  USERS_LOADING
} from '../../types/store/user.action.types'

export const createUser = (args: Omit<IUser, 'id'>): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: USERS_LOADING })
    addUserToStorage(args)
      .then((user: IUser) => dispatch({ type: CREATE_USER_SUCCESS, payload: user }))
      .catch(() => dispatch({ type: CREATE_USER_FAILED }))
  }
}

export const getUsers = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: USERS_LOADING })
    getUsersFromStorage()
      .then((users: Map<string, IUser>) => dispatch({ type: GET_USERS_SUCCESS, payload: users }))
      .catch(() => dispatch({ type: GET_USERS_FAILED }))
  }
}
