import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

export const CREDENTIALS_LOADING = '[CREDENTIAL] CREDENTIALS_LOADING';
export type CREDENTIALS_LOADING = typeof CREDENTIALS_LOADING;
export const GET_CREDENTIALS_SUCCESS = '[CREDENTIAL] GET_CREDENTIALS_SUCCESS';
export type GET_CREDENTIALS_SUCCESS = typeof GET_CREDENTIALS_SUCCESS;
export const GET_CREDENTIALS_FAILED = '[CREDENTIAL] GET_CREDENTIALS_FAILED ';
export type GET_CREDENTIALS_FAILED = typeof GET_CREDENTIALS_FAILED;
export const STORE_CREDENTIAL_SUCCESS = '[CREDENTIAL] STORE_CREDENTIAL_SUCCESS';
export type STORE_CREDENTIAL_SUCCESS = typeof STORE_CREDENTIAL_SUCCESS;
export const STORE_CREDENTIAL_FAILED = '[CREDENTIAL] STORE_CREDENTIAL_FAILED';
export type STORE_CREDENTIAL_FAILED = typeof STORE_CREDENTIAL_FAILED;
export const DELETE_CREDENTIAL_SUCCESS = '[CREDENTIAL] DELETE_CREDENTIAL_SUCCESS';
export type DELETE_CREDENTIAL_SUCCESS = typeof DELETE_CREDENTIAL_SUCCESS;
export const DELETE_CREDENTIAL_FAILED = '[CREDENTIAL] DELETE_CREDENTIAL_FAILED';
export type DELETE_CREDENTIAL_FAILED = typeof DELETE_CREDENTIAL_FAILED;
export const CREATE_CREDENTIAL_SUCCESS = '[CREDENTIAL] CREATE_CREDENTIAL_SUCCESS';
export type CREATE_CREDENTIAL_SUCCESS = typeof CREATE_CREDENTIAL_SUCCESS;
export const CREATE_CREDENTIAL_FAILED = '[CREDENTIAL] CREATE_CREDENTIAL_FAILED';
export type CREATE_CREDENTIAL_FAILED = typeof CREATE_CREDENTIAL_FAILED;
export const CLEAR_CREDENTIALS = '[CREDENTIAL] CLEAR_CREDENTIALS';
export type CLEAR_CREDENTIALS = typeof CLEAR_CREDENTIALS;

interface ICredentialsLoading {
  type: CREDENTIALS_LOADING;
}

interface IGetCredentialsSuccessAction {
  payload: Array<CredentialSummary>;
  type: GET_CREDENTIALS_SUCCESS;
}

interface IGetCredentialsFailedAction {
  type: GET_CREDENTIALS_FAILED;
}

interface IStoreCredentialsSuccessAction {
  payload: CredentialSummary;
  type: STORE_CREDENTIAL_SUCCESS;
}

interface IStoreCredentialsFailedAction {
  type: STORE_CREDENTIAL_FAILED;
}

interface IDeleteCredentialsSuccessAction {
  payload: string;
  type: DELETE_CREDENTIAL_SUCCESS;
}

interface IDeleteCredentialsFailedAction {
  type: DELETE_CREDENTIAL_FAILED;
}

interface ICreateCredentialsSuccessAction {
  payload: CredentialSummary;
  type: CREATE_CREDENTIAL_SUCCESS;
}

interface ICreateCredentialsFailedAction {
  type: CREATE_CREDENTIAL_FAILED;
}

interface IClearCredentialsAction {
  type: CLEAR_CREDENTIALS;
}

export type CredentialActionTypes =
  | ICredentialsLoading
  | IGetCredentialsSuccessAction
  | IGetCredentialsFailedAction
  | IStoreCredentialsSuccessAction
  | IStoreCredentialsFailedAction
  | IDeleteCredentialsSuccessAction
  | IDeleteCredentialsFailedAction
  | ICreateCredentialsSuccessAction
  | ICreateCredentialsFailedAction
  | IClearCredentialsAction;
