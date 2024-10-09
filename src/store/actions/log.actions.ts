import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {RootState} from '../../types';
import {Action} from 'redux';
import agent from '../../agent';
import {LogActivityEventArgs} from '@sphereon/ssi-sdk.event-logger';

export const storeEventLog = (event: LogActivityEventArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    await agent.loggerLogActivityEvent(event);
  };
};

export const getActivityLogs = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    await agent.loggerGetActivityEvents();
  };
};
