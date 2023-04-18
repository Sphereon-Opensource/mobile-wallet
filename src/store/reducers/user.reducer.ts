import {IUser} from '../../types';
import {
  CREATE_USER_FAILED,
  CREATE_USER_SUCCESS,
  GET_USERS_FAILED,
  GET_USERS_SUCCESS,
  LOGIN_FAILED,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  PIN_VERIFICATION_REQUIRED,
  UPDATE_USER_FAILED,
  UPDATE_USER_SUCCESS,
  UserActionTypes,
  USERS_LOADING,
} from '../../types/store/user.action.types';
import {IUserState} from '../../types/store/user.types';

const initialState: IUserState = {
  loading: false,
  users: new Map<string, IUser>(),
  activeUser: undefined,
  isPINVerificationRequired: false
};

const userReducer = (state: IUserState = initialState, action: UserActionTypes): IUserState => {
  switch (action.type) {
    case USERS_LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    case CREATE_USER_SUCCESS: {
      return {
        ...state,
        users: state.users.set(action.payload.id, action.payload),
        loading: false,
      };
    }
    case CREATE_USER_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case GET_USERS_SUCCESS: {
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    }
    case GET_USERS_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case LOGIN_SUCCESS: {
      return {
        ...state,
        activeUser: action.payload,
        loading: false,
      };
    }
    case LOGOUT_SUCCESS: {
      return {
        ...state,
        activeUser: undefined,
        loading: false,
      };
    }
    case LOGIN_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case UPDATE_USER_SUCCESS: {
      return {
        ...state,
        users: state.users.set(action.payload.id, action.payload),
        activeUser: action.payload,
        loading: false,
      };
    }
    case UPDATE_USER_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case PIN_VERIFICATION_REQUIRED: {
      return {
        ...state,
        isPINVerificationRequired: action.payload,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default userReducer;
