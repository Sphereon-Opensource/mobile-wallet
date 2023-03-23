import {
  CorrelationIdentifierEnum,
  IContact,
  IdentityRoleEnum,
  IIdentity
} from '@sphereon/ssi-sdk-data-store'
import {Action} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {v4 as uuidv4} from 'uuid';

import {translate} from '../../localization/Localization';
import {getContacts as getContactsFromStorage, createContact as storeContact, addIdentity as identityAdd} from '../../services/contactService';
import {IUser, IUserIdentifier, RootState, ToastTypeEnum} from '../../types';
import {
  ADD_IDENTITY_FAILED,
  ADD_IDENTITY_SUCCESS,
  CONTACTS_LOADING,
  CREATE_CONTACT_FAILED,
  CREATE_CONTACT_SUCCESS,
  GET_CONTACTS_FAILED,
  GET_CONTACTS_SUCCESS, IAddIdentityArgs,
  ICreateContactArgs
} from '../../types/store/contact.action.types'
import {showToast} from '../../utils/ToastUtils';
import store from '../index';

export const getContacts = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: CONTACTS_LOADING});
    getUserContact().then((userContact: IContact) => {
      getContactsFromStorage()
        .then(async (contacts: Array<IContact>) => dispatch({type: GET_CONTACTS_SUCCESS, payload: [...contacts, userContact]}))
        .catch(() => dispatch({type: GET_CONTACTS_FAILED}));
    });
  };
};

export const createContact = (args: ICreateContactArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: CONTACTS_LOADING});
    storeContact(args)
      .then((contact: IContact) => {
        dispatch({type: CREATE_CONTACT_SUCCESS, payload: contact});
        showToast(ToastTypeEnum.TOAST_SUCCESS, translate('contact_add_success_toast'));
      })
      .catch(() => dispatch({type: CREATE_CONTACT_FAILED}));
  };
};

export const addIdentity = (args: IAddIdentityArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: CONTACTS_LOADING});
    identityAdd(args)
    .then((identity: IIdentity) => dispatch({type: ADD_IDENTITY_SUCCESS, payload: { contactId: args.contactId, identity }}))
    .catch(() => dispatch({type: ADD_IDENTITY_FAILED}));
  };
};

const getUserContact = async (): Promise<IContact> => {
  const userState = store.getState().user;
  // TODO supporting only one user at the moment
  const user: IUser = userState.activeUser!

  const userFullName = `${user.firstName} ${user.lastName}`;

  return {
    id: user.id,
    name: userFullName,
    alias: userFullName,
    uri: user.emailAddress,
    roles: [IdentityRoleEnum.ISSUER],
    identities: user.identifiers.map((identifier: IUserIdentifier) => ({
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
    createdAt: user.createdAt,
    lastUpdatedAt: user.lastUpdatedAt,
  };
};
