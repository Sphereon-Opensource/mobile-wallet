import {Action, CombinedState} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';

import {getUsers as getUsersFromStorage, updateUser, createUser as userCreate} from '../../services/userService';
import {BasicUser, IAddIdentifierArgs, IUser, RootState} from '../../types';
import {
  CREATE_USER_FAILED,
  CREATE_USER_SUCCESS,
  GET_USERS_FAILED,
  GET_USERS_SUCCESS,
  REMOVE_ACTIVE_USER_SUCCESS,
  SET_ACTIVE_USER_FAILED,
  SET_ACTIVE_USER_SUCCESS,
  UPDATE_USER_FAILED,
  UPDATE_USER_SUCCESS,
  USERS_LOADING,
} from '../../types/store/user.action.types';
import {IUserState} from '../../types/store/user.types';

export const createUser = (args: BasicUser): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: USERS_LOADING});
    userCreate(args)
      .then((user: IUser) => dispatch({type: CREATE_USER_SUCCESS, payload: user}))
      .catch(() => dispatch({type: CREATE_USER_FAILED}));
  };
};

export const getUsers = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: USERS_LOADING});
    getUsersFromStorage()
      .then((users: Map<string, IUser>) => dispatch({type: GET_USERS_SUCCESS, payload: users}))
      .catch(() => dispatch({type: GET_USERS_FAILED}));
  };
};

export const addIdentifier = (args: IAddIdentifierArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>, getState: CombinedState<any>) => {
    dispatch({type: USERS_LOADING});
    const userSate: IUserState = getState().user;
    const userIdentifier = {
      did: args.did,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    };
    // We are currently only supporting a single user right now
    const user: IUser = {
      ...userSate.users.values().next().value,
      identifiers: [...userSate.users.values().next().value.identifiers, userIdentifier],
    };

    updateUser(user)
      .then((user: IUser) => dispatch({type: UPDATE_USER_SUCCESS, payload: user}))
      .catch(() => dispatch({type: UPDATE_USER_FAILED}));
  };
};

export const setActiveUser = (userId: string): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: USERS_LOADING});
    getUsersFromStorage()
      .then((users: Map<string, IUser>) => {
        const user = users.get(userId);
        if (user) {
          dispatch({type: SET_ACTIVE_USER_SUCCESS, payload: user});
        } else {
          dispatch({type: SET_ACTIVE_USER_FAILED});
        }
      })
      .catch(() => dispatch({type: SET_ACTIVE_USER_FAILED}));
  };
};

export const removeActiveUser = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: USERS_LOADING});
    dispatch({type: REMOVE_ACTIVE_USER_SUCCESS, payload: null});
  };
};
