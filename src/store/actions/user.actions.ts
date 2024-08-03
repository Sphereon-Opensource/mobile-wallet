import {Action, CombinedState} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';

import {DB_CONNECTION_NAME} from '../../@config/database';
import IntentHandler from '../../handlers/IntentHandler';
import LockingHandler from '../../handlers/LockingHandler';
import {OnboardingMachine} from '../../machines/onboardingMachine';
import {storageDeletePin} from '../../services/storageService';
import {
  getUsers as userServiceGetUsers,
  deleteUser as userServiceDeleteUser,
  updateUser as userServiceUpdateUser,
  createUser as userServiceCreateUser,
} from '../../services/userService';
import {BasicUser, IAddIdentifierArgs, IUser, RootState} from '../../types';
import {CLEAR_CONTACTS} from '../../types/store/contact.action.types';
import {IContactState} from '../../types/store/contact.types';
import {CLEAR_CREDENTIALS} from '../../types/store/credential.action.types';
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
  USERS_LOADING,
} from '../../types/store/user.action.types';
import {IUserState} from '../../types/store/user.types';

import {getContacts} from './contact.actions';
import {getVerifiableCredentials} from './credential.actions';
import {resetDatabase} from '@sphereon/ssi-sdk.agent-config';

export const createUser = (args: BasicUser): ThunkAction<Promise<IUser>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<IUser> => {
    dispatch({type: USERS_LOADING});
    return userServiceCreateUser(args)
      .then((user: IUser) => {
        dispatch({type: CREATE_USER_SUCCESS, payload: user});
        return user;
      })
      .catch((error: Error) => {
        dispatch({type: CREATE_USER_FAILED});
        return Promise.reject(error);
      });
  };
};

export const getUsers = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: USERS_LOADING});
    userServiceGetUsers()
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

    userServiceUpdateUser(user)
      .then((user: IUser) => dispatch({type: UPDATE_USER_SUCCESS, payload: user}))
      .catch(() => dispatch({type: UPDATE_USER_FAILED}));
  };
};

export const login = (userId: string): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>, getState: CombinedState<any>) => {
    dispatch({type: USERS_LOADING});
    await userServiceGetUsers()
      .then(async (users: Map<string, IUser>) => {
        const user = users.get(userId);
        if (user) {
          dispatch({type: LOGIN_SET_ACTIVE_USER, payload: user});

          // We do we need to use the while loop here? The above is a sync action that does not use a thunk, thus getState().user should be available already
          const maxWaitTime = 5000;
          let startTime = Date.now();
          let userState: IUserState = getState().user;
          while (!userState.activeUser && Date.now() - startTime < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 50));
            userState = getState().user;
          }
          await dispatch(getContacts());
          startTime = Date.now();
          let contactState: IContactState = getState().contact;
          // this will work because we generate a contact from the user so there is always 1 present
          while (contactState.contacts.length === 0 && Date.now() - startTime < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 50));
            contactState = getState().contact;
          }
          await dispatch(getVerifiableCredentials());
          (await LockingHandler.getInstance()).isLocked = false;

          dispatch({type: LOGIN_SUCCESS});
          const intentHandler = IntentHandler.getInstance();
          await intentHandler.enable();

          if (intentHandler.hasDeepLink()) {
            intentHandler.openDeepLinkIfExistsAndAppUnlocked();
          }
        } else {
          dispatch({type: LOGIN_FAILED});
        }
      })
      .catch(() => dispatch({type: LOGIN_FAILED}));
  };
};

export const logout = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    // dispatch({type: USERS_LOADING});
    dispatch({type: LOGOUT_SUCCESS});
    dispatch({type: CLEAR_CREDENTIALS});
    dispatch({type: CLEAR_CONTACTS});
  };
};

// This action acts like there is only one user present, so everything is getting removed. in the future we might just only want to delete a user
export const deleteUser = (userId: string): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: USERS_LOADING});
    // first delete the user (including redux store) then logout (remove active user). As then the switch navigator will navigate directly to the onboarding stack
    // without an active user the switch navigator will navigate to the login screen. So doing this first would flicker the login screen
    OnboardingMachine.clearInstance({stop: true});
    userServiceDeleteUser(userId)
      .then(() => {
        dispatch({type: DELETE_USER_SUCCESS, payload: userId});

        dispatch({type: LOGOUT_SUCCESS});
        void resetDatabase(DB_CONNECTION_NAME);
        void storageDeletePin();

        // TODO would be nice if we have 1 action that deletes the content a user has
        dispatch({type: CLEAR_CREDENTIALS});
        dispatch({type: CLEAR_CONTACTS});
        OnboardingMachine.getInstance().start();
      })
      .catch(() => {
        dispatch({type: DELETE_USER_FAILED});
      });
  };
};
