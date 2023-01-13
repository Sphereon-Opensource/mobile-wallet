import { IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'
import { Dispatch } from 'react'
import { AnyAction } from 'redux'

import {
  CONTACTS_LOADING,
  CREATE_CONTACT_FAILED,
  CREATE_CONTACT_SUCCESS,
  GET_CONTACTS_FAILED,
  GET_CONTACTS_SUCCESS,
  ICreateContactArgs
} from '../../@types/store/contact.action.types'
import { getContactsFromStorage, createContact as storeContact } from '../../services/contactService'

export const getContacts = (): ((dispatch: Dispatch<AnyAction>) => void) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: CONTACTS_LOADING })
    getContactsFromStorage()
      .then((contacts: Array<IConnectionParty>) => dispatch({ type: GET_CONTACTS_SUCCESS, payload: contacts }))
      .catch(() => dispatch({ type: GET_CONTACTS_FAILED }))
  }
}

export const createContact = (args: ICreateContactArgs): ((dispatch: Dispatch<AnyAction>) => void) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: CONTACTS_LOADING })
    storeContact(args)
      .then((contact: IConnectionParty) => dispatch({ type: CREATE_CONTACT_SUCCESS, payload: contact }))
      .catch(() => dispatch({ type: CREATE_CONTACT_FAILED }))
  }
}
