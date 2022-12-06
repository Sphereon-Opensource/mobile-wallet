import { IContact } from '../contact'

export const CONTACTS_LOADING = '[CONTACT] CONTACTS_LOADING'
export type CONTACTS_LOADING = typeof CONTACTS_LOADING
export const GET_CONTACTS_SUCCESS = '[CONTACT] GET_CONTACTS_SUCCESS'
export type GET_CONTACTS_SUCCESS = typeof GET_CONTACTS_SUCCESS
export const GET_CONTACTS_FAILED = '[CONTACT] GET_CONTACTS_FAILED '
export type GET_CONTACTS_FAILED = typeof GET_CONTACTS_FAILED

export interface IContactState {
  loading: boolean
  contacts: Array<IContact>
}

interface IContactsLoading {
  type: CONTACTS_LOADING
}

interface IGetContactsSuccessAction {
  type: GET_CONTACTS_SUCCESS
  payload: Array<IContact>
}

interface IGetContactsFailedAction {
  type: GET_CONTACTS_FAILED
}

export type ContactActionTypes = IContactsLoading | IGetContactsSuccessAction | IGetContactsFailedAction
