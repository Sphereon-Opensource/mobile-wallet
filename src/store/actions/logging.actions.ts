import {Action} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {
  storeActivityLogging as loggingServiceStoreActivityLogging,
  getActivityLogging as loggingServiceGetActivityLogging,
} from '../../services/loggingService';
import {RootState} from '../../types';
import {NonPersistedActivityLoggingEvent} from '@sphereon/ssi-sdk.event-logger';
import {
  STORE_ACTIVITY_LOGGING_FAILED,
  STORE_ACTIVITY_LOGGING_SUCCESS,
  GET_ACTIVITY_LOGGING_FAILED,
  GET_ACTIVITY_LOGGING_SUCCESS,
  LOGGING_LOADING,
} from '../../types/store/logging.action.types';

export const storeActivityLogging = (args: NonPersistedActivityLoggingEvent): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: LOGGING_LOADING});
    loggingServiceStoreActivityLogging(args)
      .then(activityLogging => dispatch({type: STORE_ACTIVITY_LOGGING_SUCCESS, payload: activityLogging}))
      .catch(() => dispatch({type: STORE_ACTIVITY_LOGGING_FAILED}));
  };
};

export const getActivityLogging = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: LOGGING_LOADING});
    loggingServiceGetActivityLogging()
      .then(activityLogging => dispatch({type: GET_ACTIVITY_LOGGING_SUCCESS, payload: activityLogging}))
      .catch(() => dispatch({type: GET_ACTIVITY_LOGGING_FAILED}));
  };
};
