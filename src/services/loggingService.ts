import {ActivityLoggingEvent} from '@sphereon/ssi-sdk.core';
import {NonPersistedAuditLoggingEvent} from '@sphereon/ssi-sdk.event-logger';
import agent from '../agent';

export const storeActivityLogging = async (args: NonPersistedAuditLoggingEvent): Promise<ActivityLoggingEvent> => {
  return agent.loggerLogActivityEvent({
    event: args,
  });
};

export const getActivityLogging = async (): Promise<Array<ActivityLoggingEvent>> => {
  return agent.loggerGetActivityEvents();
};
