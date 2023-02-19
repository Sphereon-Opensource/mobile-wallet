import { IUser } from '../user'

export const USERS_LOADING = '[USER] USERS_LOADING'
export type USERS_LOADING = typeof USERS_LOADING
export const CREATE_USER_SUCCESS = '[USER] CREATE_USER_SUCCESS'
export type CREATE_USER_SUCCESS = typeof CREATE_USER_SUCCESS
export const CREATE_USER_FAILED = '[USER] CREATE_USER_FAILED'
export type CREATE_USER_FAILED = typeof CREATE_USER_FAILED

export const GET_USERS_SUCCESS = '[USER] GET_USERS_SUCCESS'
export type GET_USERS_SUCCESS = typeof GET_USERS_SUCCESS
export const GET_USERS_FAILED = '[USER] GET_USERS_FAILED'
export type GET_USERS_FAILED = typeof GET_USERS_FAILED

interface IUsersLoading {
  type: USERS_LOADING
}

interface ICreateUserActionSuccessAction {
  type: CREATE_USER_SUCCESS
  payload: IUser
}

interface ICreateUserActionFailedAction {
  type: CREATE_USER_FAILED
}

interface IGetUsersActionSuccessAction {
  type: GET_USERS_SUCCESS
  payload: Map<string, IUser>
}

interface IGetUsersActionFailedAction {
  type: GET_USERS_FAILED
}

export type UserActionTypes =
  | IUsersLoading
  | IGetUsersActionFailedAction
  | IGetUsersActionSuccessAction
  | ICreateUserActionSuccessAction
  | ICreateUserActionFailedAction
