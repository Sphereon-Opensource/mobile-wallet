import {
  CredentialActionTypes,
  CREDENTIALS_LOADING,
  GET_CREDENTIALS_FAILED,
  GET_CREDENTIALS_SUCCESS,
  ICredentialState,
  STORE_CREDENTIAL_FAILED,
  STORE_CREDENTIAL_SUCCESS
} from '../../@types/store/credential.action.types'

const initialState: ICredentialState = {
  loading: false,
  verifiableCredentials: []
}

const credentialReducer = (state: ICredentialState = initialState, action: CredentialActionTypes): ICredentialState => {
  switch (action.type) {
    case CREDENTIALS_LOADING: {
      return {
        ...state,
        loading: true
      }
    }
    case GET_CREDENTIALS_SUCCESS: {
      return {
        ...state,
        verifiableCredentials: action.payload,
        loading: false
      }
    }
    case GET_CREDENTIALS_FAILED: {
      return {
        ...state,
        loading: false
      }
    }
    case STORE_CREDENTIAL_SUCCESS: {
      return {
        ...state,
        verifiableCredentials: [...state.verifiableCredentials, action.payload],
        loading: false
      }
    }
    case STORE_CREDENTIAL_FAILED: {
      return {
        ...state,
        loading: false
      }
    }
    default:
      return state
  }
}

export default credentialReducer
