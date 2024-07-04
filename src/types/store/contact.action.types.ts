import {
  NonPersistedIdentity,
  Identity,
  NonPersistedParty,
  NonPersistedContact,
  NonPersistedPartyType as NonPersistedContactType,
  Party,
} from '@sphereon/ssi-sdk.data-store';

export const CONTACTS_LOADING = '[CONTACT] CONTACTS_LOADING';
export type CONTACTS_LOADING = typeof CONTACTS_LOADING;
export const GET_CONTACTS_SUCCESS = '[CONTACT] GET_CONTACTS_SUCCESS';
export type GET_CONTACTS_SUCCESS = typeof GET_CONTACTS_SUCCESS;
export const GET_CONTACTS_FAILED = '[CONTACT] GET_CONTACTS_FAILED ';
export type GET_CONTACTS_FAILED = typeof GET_CONTACTS_FAILED;
export const CREATE_CONTACT_SUCCESS = '[CONTACT] CREATE_CONTACT_SUCCESS';
export type CREATE_CONTACT_SUCCESS = typeof CREATE_CONTACT_SUCCESS;
export const CREATE_CONTACT_FAILED = '[CONTACT] STORE_CONTACT_FAILED';
export type CREATE_CONTACT_FAILED = typeof CREATE_CONTACT_FAILED;
export const UPDATE_CONTACT_SUCCESS = '[CONTACT] UPDATE_CONTACT_SUCCESS';
export type UPDATE_CONTACT_SUCCESS = typeof UPDATE_CONTACT_SUCCESS;
export const UPDATE_CONTACT_FAILED = '[CONTACT] UPDATE_CONTACT_FAILED';
export type UPDATE_CONTACT_FAILED = typeof UPDATE_CONTACT_FAILED;
export const DELETE_CONTACT_SUCCESS = '[CONTACT] DELETE_CONTACT_SUCCESS';
export type DELETE_CONTACT_SUCCESS = typeof DELETE_CONTACT_SUCCESS;
export const DELETE_CONTACT_FAILED = '[CONTACT] DELETE_CONTACT_FAILED';
export type DELETE_CONTACT_FAILED = typeof DELETE_CONTACT_FAILED;
export const ADD_IDENTITY_SUCCESS = '[CONTACT] ADD_IDENTITY_SUCCESS';
export type ADD_IDENTITY_SUCCESS = typeof ADD_IDENTITY_SUCCESS;
export const ADD_IDENTITY_FAILED = '[CONTACT] ADD_IDENTITY_FAILED';
export type ADD_IDENTITY_FAILED = typeof ADD_IDENTITY_FAILED;
export const CLEAR_CONTACTS = '[CONTACT] CLEAR_CONTACTS';
export type CLEAR_CONTACTS = typeof CLEAR_CONTACTS;

interface IContactsLoading {
  type: CONTACTS_LOADING;
}

interface IGetContactsSuccessAction {
  type: GET_CONTACTS_SUCCESS;
  payload: Array<Party>;
}

interface IGetContactsFailedAction {
  type: GET_CONTACTS_FAILED;
}

interface ICreateContactSuccessAction {
  type: CREATE_CONTACT_SUCCESS;
  payload: Party;
}

interface ICreateContactFailedAction {
  type: CREATE_CONTACT_FAILED;
}

interface IUpdateContactSuccessAction {
  type: UPDATE_CONTACT_SUCCESS;
  payload: Party;
}

interface IUpdateContactFailedAction {
  type: UPDATE_CONTACT_FAILED;
}

interface IDeleteContactSuccessAction {
  type: DELETE_CONTACT_SUCCESS;
  payload: string;
}

interface IDeleteContactFailedAction {
  type: DELETE_CONTACT_FAILED;
}

interface IAddIdentitySuccessAction {
  type: ADD_IDENTITY_SUCCESS;
  payload: IAddIdentitySuccessActionPayload;
}

interface IAddIdentityFailedAction {
  type: ADD_IDENTITY_FAILED;
}

export type ICreateContactArgs = Omit<NonPersistedParty, 'contact' | 'partyType'> &
  NonPersistedContact & {
    contactType: NonPersistedContactType;
  };

export interface IUpdateContactArgs {
  contact: Party;
}

export interface IAddIdentityArgs {
  contactId: string;
  identity: NonPersistedIdentity;
}

export interface IAddIdentitySuccessActionPayload {
  contactId: string;
  identity: Identity;
}

interface IClearContactsAction {
  type: CLEAR_CONTACTS;
}

export type ContactActionTypes =
  | IContactsLoading
  | IGetContactsSuccessAction
  | IGetContactsFailedAction
  | ICreateContactSuccessAction
  | ICreateContactFailedAction
  | IUpdateContactSuccessAction
  | IUpdateContactFailedAction
  | IDeleteContactSuccessAction
  | IDeleteContactFailedAction
  | IAddIdentitySuccessAction
  | IAddIdentityFailedAction
  | IClearContactsAction;
