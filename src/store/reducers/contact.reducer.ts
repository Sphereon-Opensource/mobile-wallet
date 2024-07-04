import {Party} from '@sphereon/ssi-sdk.data-store';

import {SortOrder} from '../../types';
import {
  ADD_IDENTITY_FAILED,
  ADD_IDENTITY_SUCCESS,
  CLEAR_CONTACTS,
  ContactActionTypes,
  CONTACTS_LOADING,
  CREATE_CONTACT_FAILED,
  CREATE_CONTACT_SUCCESS,
  DELETE_CONTACT_FAILED,
  DELETE_CONTACT_SUCCESS,
  GET_CONTACTS_FAILED,
  GET_CONTACTS_SUCCESS,
  UPDATE_CONTACT_FAILED,
  UPDATE_CONTACT_SUCCESS,
} from '../../types/store/contact.action.types';
import {IContactState} from '../../types/store/contact.types';
import {sortBy} from '../../utils/SortUtils';

const initialState: IContactState = {
  loading: false,
  contacts: [],
};

const contactReducer = (state: IContactState = initialState, action: ContactActionTypes): IContactState => {
  switch (action.type) {
    case CONTACTS_LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_CONTACTS_SUCCESS: {
      return {
        ...state,
        contacts: action.payload.sort(sortBy('contact.displayName', SortOrder.ASC)),
        loading: false,
      };
    }
    case GET_CONTACTS_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case CREATE_CONTACT_SUCCESS: {
      return {
        ...state,
        contacts: [...state.contacts, action.payload].sort(sortBy('contact.displayName', SortOrder.ASC)),
        loading: false,
      };
    }
    case CREATE_CONTACT_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case UPDATE_CONTACT_SUCCESS: {
      return {
        ...state,
        contacts: [...state.contacts.filter((contact: Party): boolean => contact.id !== action.payload.id), action.payload].sort(
          sortBy('contact.displayName', SortOrder.ASC),
        ),
        loading: false,
      };
    }
    case UPDATE_CONTACT_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case DELETE_CONTACT_SUCCESS: {
      return {
        ...state,
        contacts: state.contacts
          .filter((contact: Party): boolean => contact.id !== action.payload)
          .sort(sortBy('contact.displayName', SortOrder.ASC)),
        loading: false,
      };
    }
    case DELETE_CONTACT_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case ADD_IDENTITY_SUCCESS: {
      return {
        ...state,
        contacts: state.contacts
          .map(
            (contact: Party): Party =>
              contact.id === action.payload.contactId ? {...contact, identities: [...contact!.identities, action.payload.identity]} : contact,
          )
          .sort(sortBy('contact.displayName', SortOrder.ASC)),
        loading: false,
      };
    }
    case ADD_IDENTITY_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case CLEAR_CONTACTS: {
      return initialState;
    }
    default:
      return state;
  }
};

export default contactReducer;
