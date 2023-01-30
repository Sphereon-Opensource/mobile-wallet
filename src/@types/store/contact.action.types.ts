import {
  BasicConnectionIdentifier,
  BasicPartyIdentifier,
  IConnectionParty
} from '@sphereon/ssi-sdk-data-store-common'

export const CONTACTS_LOADING = '[CONTACT] CONTACTS_LOADING'
export type CONTACTS_LOADING = typeof CONTACTS_LOADING
export const GET_CONTACTS_SUCCESS = '[CONTACT] GET_CONTACTS_SUCCESS'
export type GET_CONTACTS_SUCCESS = typeof GET_CONTACTS_SUCCESS
export const GET_CONTACTS_FAILED = '[CONTACT] GET_CONTACTS_FAILED '
export type GET_CONTACTS_FAILED = typeof GET_CONTACTS_FAILED
export const CREATE_CONTACT_SUCCESS = '[CONTACT] CREATE_CONTACT_SUCCESS'
export type CREATE_CONTACT_SUCCESS = typeof CREATE_CONTACT_SUCCESS
export const CREATE_CONTACT_FAILED = '[CONTACT] STORE_CONTACT_FAILED'
export type CREATE_CONTACT_FAILED = typeof CREATE_CONTACT_FAILED

export interface IContactState {
  loading: boolean
  contacts: Array<IConnectionParty>
}

interface IContactsLoading {
  type: CONTACTS_LOADING
}

interface IGetContactsSuccessAction {
  type: GET_CONTACTS_SUCCESS
  payload: Array<IConnectionParty>
}

interface IGetContactsFailedAction {
  type: GET_CONTACTS_FAILED
}

interface ICreateContactSuccessAction {
  payload: IConnectionParty
  type: CREATE_CONTACT_SUCCESS
}

interface ICreateContactFailedAction {
  type: CREATE_CONTACT_FAILED
}

export type ContactActionTypes =
  | IContactsLoading
  | IGetContactsSuccessAction
  | IGetContactsFailedAction
  | ICreateContactSuccessAction
  | ICreateContactFailedAction

export interface ICreateContactArgs {
  name: string
  alias: string
  uri?: string
  identifier: BasicPartyIdentifier
}

