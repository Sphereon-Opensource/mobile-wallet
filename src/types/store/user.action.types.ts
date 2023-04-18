import {IUser} from '../user';

export const USERS_LOADING = '[USER] USERS_LOADING';
export type USERS_LOADING = typeof USERS_LOADING;
export const CREATE_USER_SUCCESS = '[USER] CREATE_USER_SUCCESS';
export type CREATE_USER_SUCCESS = typeof CREATE_USER_SUCCESS;
export const CREATE_USER_FAILED = '[USER] CREATE_USER_FAILED';
export type CREATE_USER_FAILED = typeof CREATE_USER_FAILED;
export const GET_USERS_SUCCESS = '[USER] GET_USERS_SUCCESS';
export type GET_USERS_SUCCESS = typeof GET_USERS_SUCCESS;
export const GET_USERS_FAILED = '[USER] GET_USERS_FAILED';
export type GET_USERS_FAILED = typeof GET_USERS_FAILED;
export const LOGIN_SUCCESS = '[USER] LOGIN_SUCCESS';
export type LOGIN_SUCCESS = typeof LOGIN_SUCCESS;
export const LOGIN_FAILED = '[USER] LOGIN_FAILED';
export type LOGIN_FAILED = typeof LOGIN_FAILED;
export const LOGOUT_SUCCESS = '[USER] LOGOUT_SUCCESS';
export type LOGOUT_SUCCESS = typeof LOGOUT_SUCCESS;
export const UPDATE_USER_SUCCESS = '[USER] UPDATE_USER_SUCCESS';
export type UPDATE_USER_SUCCESS = typeof UPDATE_USER_SUCCESS;
export const UPDATE_USER_FAILED = '[USER] UPDATE_USER_FAILED';
export type UPDATE_USER_FAILED = typeof UPDATE_USER_FAILED;
export const PIN_VERIFICATION_REQUIRED = '[USER] PIN_VERIFICATION_REQUIRED';
export type PIN_VERIFICATION_REQUIRED = typeof PIN_VERIFICATION_REQUIRED;


interface IUsersLoading {
  type: USERS_LOADING;
}

interface ICreateUserActionSuccessAction {
  type: CREATE_USER_SUCCESS;
  payload: IUser;
}

interface ICreateUserActionFailedAction {
  type: CREATE_USER_FAILED;
}

interface IGetUsersActionSuccessAction {
  type: GET_USERS_SUCCESS;
  payload: Map<string, IUser>;
}

interface IGetUsersActionFailedAction {
  type: GET_USERS_FAILED;
}

interface ILoginActionFailedAction {
  type: LOGIN_FAILED;
}

interface ILoginActionSuccessAction {
  type: LOGIN_SUCCESS;
  payload: IUser;
}

interface ILogoutActionSuccessAction {
  type: LOGOUT_SUCCESS;
}

interface IUpdateUserActionSuccessAction {
  type: UPDATE_USER_SUCCESS;
  payload: IUser;
}

interface IUpdateUserActionFailedAction {
  type: UPDATE_USER_FAILED;
}

interface IPINVerificationRequiredAction {
  type: PIN_VERIFICATION_REQUIRED;
  payload: boolean;
}

export type UserActionTypes =
  | IUsersLoading
  | IGetUsersActionFailedAction
  | IGetUsersActionSuccessAction
  | ICreateUserActionSuccessAction
  | ICreateUserActionFailedAction
  | ILoginActionSuccessAction
  | ILoginActionFailedAction
  | ILogoutActionSuccessAction
  | IUpdateUserActionSuccessAction
  | IUpdateUserActionFailedAction
  | IPINVerificationRequiredAction;
