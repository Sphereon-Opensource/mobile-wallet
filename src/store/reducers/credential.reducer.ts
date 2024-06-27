import {
  CLEAR_CREDENTIALS,
  CREATE_CREDENTIAL_FAILED,
  CREATE_CREDENTIAL_SUCCESS,
  CredentialActionTypes,
  CREDENTIALS_LOADING,
  DELETE_CREDENTIAL_FAILED,
  DELETE_CREDENTIAL_SUCCESS,
  GET_CREDENTIALS_FAILED,
  GET_CREDENTIALS_SUCCESS,
  STORE_CREDENTIAL_FAILED,
  STORE_CREDENTIAL_SUCCESS,
} from '../../types/store/credential.action.types';
import {ICredentialState} from '../../types/store/credential.types';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

const initialState: ICredentialState = {
  loading: false,
  verifiableCredentials: [],
};

const credentialReducer = (state: ICredentialState = initialState, action: CredentialActionTypes): ICredentialState => {
  // For WAL-605 add sorting taking inspiration from contactReducer WAL-540

  switch (action.type) {
    case CREDENTIALS_LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_CREDENTIALS_SUCCESS: {
      return {
        ...state,
        verifiableCredentials: action.payload,
        loading: false,
      };
    }
    case GET_CREDENTIALS_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case STORE_CREDENTIAL_SUCCESS: {
      return {
        ...state,
        verifiableCredentials: [...state.verifiableCredentials, action.payload],
        loading: false,
      };
    }
    case STORE_CREDENTIAL_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case DELETE_CREDENTIAL_SUCCESS: {
      return {
        ...state,
        verifiableCredentials: state.verifiableCredentials.filter((vc: CredentialSummary) => vc.hash !== action.payload),
        loading: false,
      };
    }
    case DELETE_CREDENTIAL_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case CREATE_CREDENTIAL_SUCCESS: {
      return {
        ...state,
        verifiableCredentials: [...state.verifiableCredentials, action.payload],
        loading: false,
      };
    }
    case CREATE_CREDENTIAL_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case CLEAR_CREDENTIALS: {
      return initialState;
    }
    default:
      return state;
  }
};

export default credentialReducer;
