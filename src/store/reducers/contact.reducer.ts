import {
  ContactActionTypes,
  CONTACTS_LOADING,
  GET_CONTACTS_FAILED,
  GET_CONTACTS_SUCCESS,
  IContactState
} from '../../@types/store/contact.action.types'

const initialState: IContactState = {
  loading: false,
  contacts: []
}

const contactReducer = (state: IContactState = initialState, action: ContactActionTypes): IContactState => {
  switch (action.type) {
    case CONTACTS_LOADING: {
      return {
        ...state,
        loading: true
      }
    }
    case GET_CONTACTS_SUCCESS: {
      return {
        ...state,
        contacts: action.payload,
        loading: false
      }
    }
    case GET_CONTACTS_FAILED: {
      return {
        ...state,
        loading: false
      }
    }
    default:
      return state
  }
}

export default contactReducer
