import {
  CorrelationIdentifierType,
  Party,
  CredentialRole,
  Identity,
  PartyTypeType,
  PartyOrigin,
  IdentityOrigin,
  IIssuerBranding,
} from '@sphereon/ssi-sdk.data-store';
import {Action} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {v4 as uuidv4} from 'uuid';
import {agentContext} from '../../agent';
import {translate} from '../../localization/Localization';
import {
  updateContact as editContact,
  getContacts as getContactsFromStorage,
  addIdentity as identityAdd,
  createContact as storeContact,
  removeContact,
} from '../../services/contactService';
import {IUser, IUserIdentifier, RootState, ToastTypeEnum} from '../../types';
import {
  ADD_IDENTITY_FAILED,
  ADD_IDENTITY_SUCCESS,
  CONTACTS_LOADING,
  CREATE_CONTACT_FAILED,
  CREATE_CONTACT_SUCCESS,
  DELETE_CONTACT_FAILED,
  DELETE_CONTACT_SUCCESS,
  GET_CONTACTS_FAILED,
  GET_CONTACTS_SUCCESS,
  IAddIdentityArgs,
  ICreateContactArgs,
  IUpdateContactArgs,
  UPDATE_CONTACT_FAILED,
  UPDATE_CONTACT_SUCCESS,
} from '../../types/store/contact.action.types';
import {showToast} from '../../utils/ToastUtils';
import store from '../index';
import {IUserState} from '../../types/store/user.types';
import {getIssuerBrandingFromStorage} from '../../services/brandingService';

export const getContacts = (): ThunkAction<Promise<Array<Party>>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<Array<Party>> => {
    dispatch({type: CONTACTS_LOADING});
    try {
      const userContact = await getUserContact();
      let contacts = await getContactsFromStorage({}, agentContext);

      contacts = await Promise.all(contacts.map(fetchBrandingForContact));

      const allContacts = [...contacts, userContact];
      dispatch({type: GET_CONTACTS_SUCCESS, payload: allContacts});
      return allContacts;
    } catch (error) {
      dispatch({type: GET_CONTACTS_FAILED});
      return Promise.reject(error);
    }
  };
};

async function fetchBrandingForContact(contact: Party): Promise<Party> {
  const correlationIds: string[] = contact.identities.map(identity => identity.identifier.correlationId);
  const brandingPromises = correlationIds.map(correlationId => getIssuerBrandingFromStorage({filter: [{issuerCorrelationId: correlationId}]}));
  const brandingResults = await Promise.all(brandingPromises);
  const flattenedBrandingResults: IIssuerBranding[] = brandingResults.flat();
  contact.branding = flattenedBrandingResults[0]?.localeBranding?.[0] ?? contact.branding;
  return contact;
}

export const createContact = (args: ICreateContactArgs): ThunkAction<Promise<Party>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<Party> => {
    dispatch({type: CONTACTS_LOADING});
    return storeContact(args, agentContext)
      .then((contact: Party): Party => {
        dispatch({type: CREATE_CONTACT_SUCCESS, payload: contact});
        showToast(ToastTypeEnum.TOAST_SUCCESS, {message: translate('contact_add_success_toast'), showBadge: false});
        return contact;
      })
      .catch((error: Error) => {
        dispatch({type: CREATE_CONTACT_FAILED});
        return Promise.reject(error);
      });
  };
};

export const updateContact = (args: IUpdateContactArgs): ThunkAction<Promise<Party>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<Party> => {
    dispatch({type: CONTACTS_LOADING});
    return editContact(args, agentContext)
      .then((contact: Party): Party => {
        dispatch({type: UPDATE_CONTACT_SUCCESS, payload: contact});
        showToast(ToastTypeEnum.TOAST_SUCCESS, {message: translate('contact_update_success_toast'), showBadge: false});
        return contact;
      })
      .catch((error: Error) => {
        dispatch({type: UPDATE_CONTACT_FAILED});
        return Promise.reject(error);
      });
  };
};

export const addIdentity = (args: IAddIdentityArgs): ThunkAction<Promise<Identity>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<Identity> => {
    dispatch({type: CONTACTS_LOADING});
    return identityAdd(args, agentContext)
      .then((identity: Identity) => {
        dispatch({type: ADD_IDENTITY_SUCCESS, payload: {contactId: args.contactId, identity}});
        return identity;
      })
      .catch(error => {
        //FIXME:
        console.log(
          `FIXME: We had a constraint violation, because 2 distinct issuers shared the same DID. We only search for current issuer and then look whether it has the DID: ${
            args.contactId
          }, ${JSON.stringify(args.identity)}`,
        );
        dispatch({type: ADD_IDENTITY_FAILED});
        return Promise.reject(error);
      });
  };
};

export const deleteContact = (contactId: string): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CONTACTS_LOADING});

    removeContact({contactId: contactId}, agentContext)
      .then((isDeleted: boolean): void => {
        if (isDeleted) {
          dispatch({type: DELETE_CONTACT_SUCCESS, payload: contactId});
          showToast(ToastTypeEnum.TOAST_SUCCESS, {message: translate('contact_deleted_success_toast'), showBadge: false});
        } else {
          dispatch({type: DELETE_CONTACT_FAILED});
          showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('contact_deleted_failed_toast')});
        }
      })
      .catch((): void => {
        dispatch({type: DELETE_CONTACT_FAILED});
        showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('contact_deleted_failed_toast')});
      });
  };
};

export const getUserContact = async (): Promise<Party> => {
  const userState: IUserState = store.getState().user;
  // TODO supporting only one user at the moment
  const user: IUser = userState.activeUser!;

  return {
    id: user.id,
    contact: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`,
      createdAt: user.createdAt,
      lastUpdatedAt: user.lastUpdatedAt,
    },
    partyType: {
      id: user.id,
      origin: PartyOrigin.INTERNAL,
      type: PartyTypeType.NATURAL_PERSON,
      name: 'user_party',
      tenantId: user.id,
      createdAt: user.createdAt,
      lastUpdatedAt: user.lastUpdatedAt,
    },
    electronicAddresses: [
      {
        id: user.id,
        type: 'email',
        electronicAddress: user.emailAddress,
        createdAt: user.createdAt,
        lastUpdatedAt: user.lastUpdatedAt,
      },
    ],
    physicalAddresses: [],
    relationships: [],
    uri: user.emailAddress,
    //todo: (WAL-545) handle this based on the identities available in the wallet
    roles: [CredentialRole.HOLDER],
    identities: user.identifiers.map(
      (identifier: IUserIdentifier): Identity => ({
        id: uuidv4(),
        alias: identifier.did,
        roles: [CredentialRole.HOLDER],
        origin: IdentityOrigin.INTERNAL,
        identifier: {
          id: uuidv4(),
          type: CorrelationIdentifierType.DID,
          correlationId: identifier.did,
        },
        createdAt: identifier.createdAt,
        lastUpdatedAt: identifier.lastUpdatedAt,
      }),
    ),
    createdAt: user.createdAt,
    lastUpdatedAt: user.lastUpdatedAt,
  };
};
