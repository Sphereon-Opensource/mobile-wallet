import { IContact } from '@sphereon/ssi-sdk-data-store'
import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

import { translate } from '../../localization/Localization'
import { getContacts as getContactsFromStorage, createContact as storeContact } from '../../services/contactService'
import { RootState, ToastTypeEnum } from '../../types'
import {
  CONTACTS_LOADING,
  CREATE_CONTACT_FAILED,
  CREATE_CONTACT_SUCCESS,
  GET_CONTACTS_FAILED,
  GET_CONTACTS_SUCCESS,
  ICreateContactArgs
} from '../../types/store/contact.action.types'
import { showToast } from '../../utils/ToastUtils'

export const getContacts = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: CONTACTS_LOADING })
    getContactsFromStorage()
      .then((contacts: Array<IContact>) => dispatch({ type: GET_CONTACTS_SUCCESS, payload: contacts }))
      .catch(() => dispatch({ type: GET_CONTACTS_FAILED }))
  }
}

export const createContact = (args: ICreateContactArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: CONTACTS_LOADING })
    storeContact(args)
      .then((contact: IContact) => {
        dispatch({ type: CREATE_CONTACT_SUCCESS, payload: contact })
        showToast(ToastTypeEnum.TOAST_SUCCESS, translate('contact_add_success_toast'))
      })
      .catch(() => dispatch({ type: CREATE_CONTACT_FAILED }))
  }
}
