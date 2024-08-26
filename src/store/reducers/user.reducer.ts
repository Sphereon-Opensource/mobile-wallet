import {IUser} from '../../types';
import {
  CREATE_USER_FAILED,
  CREATE_USER_SUCCESS,
  DELETE_USER_FAILED,
  DELETE_USER_SUCCESS,
  GET_USERS_FAILED,
  GET_USERS_SUCCESS,
  LOGIN_FAILED,
  LOGIN_SET_ACTIVE_USER,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
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
};

const userReducer = (state: IUserState = initialState, action: UserActionTypes): IUserState => {
  // For WAL-605 we can add sorting taking inspiration from contactReducer WAL-540

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
    case LOGIN_SET_ACTIVE_USER: {
      return {
        ...state,
        activeUser: action.payload,
        loading: true,
      };
    }
    case LOGIN_SUCCESS: {
      return {
        ...state,
        loginTime: +new Date(),
        loading: false,
      };
    }
    case LOGOUT_SUCCESS: {
      return {
        ...state,
        activeUser: undefined,
        loginTime: undefined,
        loading: false,
      };
    }
    case LOGIN_FAILED: {
      return {
        ...state,
        activeUser: undefined,
        loginTime: undefined,
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
    case DELETE_USER_SUCCESS: {
      state.users.delete(action.payload);
      return {
        ...state,
        loading: false,
      };
    }
    case DELETE_USER_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default userReducer;
