import { Dispatch } from 'react'
import { AnyAction } from 'redux'

import { IContact } from '../../@types'
import { CONTACTS_LOADING, GET_CONTACTS_FAILED, GET_CONTACTS_SUCCESS } from '../../@types/store/contact.action.types'
import { getContactsFromStorage } from '../../services/contactService'

export const getContacts = () => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: CONTACTS_LOADING })
    getContactsFromStorage()
      .then((contacts: Array<IContact>) => dispatch({ type: GET_CONTACTS_SUCCESS, payload: contacts }))
      .catch(() => dispatch({ type: GET_CONTACTS_FAILED }))
  }
}
