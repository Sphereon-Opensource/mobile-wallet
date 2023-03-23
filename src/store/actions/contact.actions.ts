import { CorrelationIdentifierEnum, IContact, IdentityRoleEnum } from '@sphereon/ssi-sdk-data-store'
import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { v4 as uuidv4 } from 'uuid'

import { translate } from '../../localization/Localization'
import { getContacts as getContactsFromStorage, createContact as storeContact } from '../../services/contactService'
import { IUserIdentifier, RootState, ToastTypeEnum } from '../../types'
import {
  CONTACTS_LOADING,
  CREATE_CONTACT_FAILED,
  CREATE_CONTACT_SUCCESS,
  GET_CONTACTS_FAILED,
  GET_CONTACTS_SUCCESS,
  ICreateContactArgs
} from '../../types/store/contact.action.types'
import { showToast } from '../../utils/ToastUtils'
import store from '../index'

export const getContacts = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: CONTACTS_LOADING })
    getUserContact().then((userContact: IContact) => {
      getContactsFromStorage()
      .then(async (contacts: Array<IContact>) => dispatch({ type: GET_CONTACTS_SUCCESS, payload: [...contacts, userContact] }))
      .catch(() => dispatch({ type: GET_CONTACTS_FAILED }))
    })
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

const getUserContact = async (): Promise<IContact> => {
  const userState = store.getState().user
  const userFullName = `${userState.activeUser?.firstName} ${userState.activeUser?.lastName}`

  return {
    id: userState.activeUser!.id,
    name: userFullName,
    alias: userFullName,
    uri: userState.activeUser?.emailAddress,
    roles: [IdentityRoleEnum.ISSUER],
    identities: userState.activeUser!.identifiers.map((identifier: IUserIdentifier) => ({
      id: uuidv4(),
      alias: identifier.did,
      roles: [IdentityRoleEnum.ISSUER],
      identifier: {
        id: uuidv4(),
        type: CorrelationIdentifierEnum.DID,
        correlationId: identifier.did,
      },
      createdAt: identifier.createdAt,
      lastUpdatedAt: identifier.lastUpdatedAt,
    })),
    createdAt: userState.activeUser!.createdAt,
    lastUpdatedAt: userState.activeUser!.lastUpdatedAt,
  }
}
