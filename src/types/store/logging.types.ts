import {ActivityLoggingEvent} from '@sphereon/ssi-sdk.core';

export interface ILoggingState {
  loading: boolean;
  activityLogging: Array<ActivityLoggingEvent>;
}
