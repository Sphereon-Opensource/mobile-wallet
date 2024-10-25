import {ActivityLoggingEvent} from '@sphereon/ssi-sdk.core';

export const LOGGING_LOADING = '[LOGGING] LOGGING_LOADING';
export type LOGGING_LOADING = typeof LOGGING_LOADING;
export const GET_ACTIVITY_LOGGING_SUCCESS = '[LOGGING] GET_ACTIVITY_LOGGING_SUCCESS';
export type GET_ACTIVITY_LOGGING_SUCCESS = typeof GET_ACTIVITY_LOGGING_SUCCESS;
export const GET_ACTIVITY_LOGGING_FAILED = '[LOGGING] GET_ACTIVITY_LOGGING_FAILED';
export type GET_ACTIVITY_LOGGING_FAILED = typeof GET_ACTIVITY_LOGGING_FAILED;
export const STORE_ACTIVITY_LOGGING_SUCCESS = '[LOGGING] STORE_ACTIVITY_LOGGING_SUCCESS';
export type STORE_ACTIVITY_LOGGING_SUCCESS = typeof STORE_ACTIVITY_LOGGING_SUCCESS;
export const STORE_ACTIVITY_LOGGING_FAILED = '[LOGGING] STORE_ACTIVITY_LOGGING_FAILED';
export type STORE_ACTIVITY_LOGGING_FAILED = typeof STORE_ACTIVITY_LOGGING_FAILED;

interface ILoggingLoading {
  type: LOGGING_LOADING;
}

interface IGetActivityLoggingActionSuccessAction {
  type: GET_ACTIVITY_LOGGING_SUCCESS;
  payload: Array<ActivityLoggingEvent>;
}

interface IGetActivityLoggingActionFailedAction {
  type: GET_ACTIVITY_LOGGING_FAILED;
}

interface IStoreActivityLoggingActionSuccessAction {
  type: STORE_ACTIVITY_LOGGING_SUCCESS;
  payload: ActivityLoggingEvent;
}

interface IStoreActivityLoggingActionFailedAction {
  type: STORE_ACTIVITY_LOGGING_FAILED;
}

export type LoggingActionTypes =
  | ILoggingLoading
  | IGetActivityLoggingActionSuccessAction
  | IGetActivityLoggingActionFailedAction
  | IStoreActivityLoggingActionSuccessAction
  | IStoreActivityLoggingActionFailedAction;
