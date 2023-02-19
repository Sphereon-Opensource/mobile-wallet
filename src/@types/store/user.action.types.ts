import { IUser } from '../user'

export const USERS_LOADING = '[USER] USERS_LOADING'
export type USERS_LOADING = typeof USERS_LOADING
export const GET_USER_SUCCESS = '[USER] GET_USER_SUCCESS'
export type GET_USER_SUCCESS = typeof GET_USER_SUCCESS
export const GET_USER_FAILED = '[USER] GET_USER_FAILED'
export type GET_USER_FAILED = typeof GET_USER_FAILED

interface IUsersLoading {
  type: USERS_LOADING
}

interface IGetUserActionSuccessAction {
  type: GET_USER_SUCCESS
  payload: IUser
}

interface IGetUserActionFailedAction {
  type: GET_USER_FAILED
}

export type UserActionTypes = IUsersLoading | IGetUserActionFailedAction | IGetUserActionSuccessAction
