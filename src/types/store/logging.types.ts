import {ActivityLoggingEvent, AuditLoggingEvent} from '@sphereon/ssi-sdk.core';

export interface ILoggingState {
  loading: boolean;
  activityLogging: Array<ActivityLoggingEvent>;
  auditLogging: Array<AuditLoggingEvent>;
}
