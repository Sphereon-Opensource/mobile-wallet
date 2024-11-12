import {ActivityLoggingEvent, AuditLoggingEvent} from '@sphereon/ssi-sdk.core';
import {NonPersistedActivityLoggingEvent, NonPersistedAuditLoggingEvent} from '@sphereon/ssi-sdk.event-logger';
import agent from '../agent';

export const storeActivityLogging = async (args: NonPersistedActivityLoggingEvent): Promise<ActivityLoggingEvent> => {
  return agent.loggerLogActivityEvent({
    event: args,
  });
};

export const getActivityLogging = async (): Promise<Array<ActivityLoggingEvent>> => {
  return agent.loggerGetActivityEvents();
};

export const storeAuditLogging = async (args: NonPersistedAuditLoggingEvent): Promise<AuditLoggingEvent> => {
  return agent.loggerLogAuditEvent({
    event: args,
  });
};

export const getAuditLogging = async (): Promise<Array<AuditLoggingEvent>> => {
  return agent.loggerGetAuditEvents();
};
