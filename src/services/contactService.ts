import {RemoveContactArgs} from '@sphereon/ssi-sdk.contact-manager';
import {Identity, Party} from '@sphereon/ssi-sdk.data-store';
import {ActionType, EventLogger, EventLoggerBuilder, InitiatorType, LoggingEventType, LogLevel, SubSystem, System} from '@sphereon/ssi-sdk.core';
import {agentContext, cmAddContact, cmAddIdentity, cmGetContacts, cmRemoveContact, cmUpdateContact} from '../agent';
import {IAddIdentityArgs, ICreateContactArgs, IGetContactsArgs, IUpdateContactArgs} from '../types';

const logger: EventLogger = new EventLoggerBuilder()
  .withContext(agentContext)
  .withLogLevel(LogLevel.INFO)
  .withSystem(System.CONTACT)
  .withSubSystem(SubSystem.CONTACT_MANAGER)
  .withInitiatorType(InitiatorType.USER)
  .build();

export const getContacts = async (args?: IGetContactsArgs): Promise<Array<Party>> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      level: LogLevel.TRACE,
      description: 'getContacts function call',
      actionType: ActionType.READ,
      actionSubType: 'get contacts',
      diagnosticData: args,
    },
  });

  return await cmGetContacts(args);
};

export const createContact = async (args: ICreateContactArgs): Promise<Party> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      description: 'createContact function call',
      actionType: ActionType.CREATE,
      actionSubType: 'create contact',
      initiatorType: InitiatorType.USER,
      diagnosticData: args,
    },
  });

  return cmAddContact(args)
    .then((contact: Party) => {
      logger.logEvent({
        type: LoggingEventType.AUDIT,
        data: {
          description: `contact ${contact.contact.displayName} created`,
          actionType: ActionType.CREATE,
          actionSubType: 'create contact',
          initiatorType: InitiatorType.USER,
          data: contact,
          diagnosticData: args,
        },
      });

      return contact;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to create contact. Error: ${error}`)));
};

export const updateContact = async (args: IUpdateContactArgs): Promise<Party> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      description: 'updateContact function call',
      actionType: ActionType.UPDATE,
      actionSubType: 'update contact',
      initiatorType: InitiatorType.USER,
      diagnosticData: args,
    },
  });

  return cmUpdateContact(args)
    .then((contact: Party) => {
      logger.logEvent({
        type: LoggingEventType.AUDIT,
        data: {
          description: `contact ${contact.contact.displayName} updated`,
          actionType: ActionType.UPDATE,
          actionSubType: 'update contact',
          initiatorType: InitiatorType.USER,
          data: contact,
          diagnosticData: args,
        },
      });

      return contact;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to update contact. Error: ${error}`)));
};

export const removeContact = async (args: RemoveContactArgs): Promise<boolean> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      description: 'removeContact function call',
      actionType: ActionType.DELETE,
      actionSubType: 'remove contact',
      initiatorType: InitiatorType.USER,
      diagnosticData: args,
    },
  });

  return cmRemoveContact(args)
    .then((isDeleted: boolean) => {
      logger.logEvent({
        type: LoggingEventType.AUDIT,
        data: {
          description: isDeleted ? `contact removed` : 'contact not removed',
          actionType: ActionType.DELETE,
          actionSubType: 'remove contact',
          initiatorType: InitiatorType.USER,
          data: isDeleted,
          diagnosticData: args,
        },
      });

      return isDeleted;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to remove contact. Error: ${error}`)));
};

export const addIdentity = async (args: IAddIdentityArgs): Promise<Identity> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      description: 'addIdentity function call',
      actionType: ActionType.CREATE,
      actionSubType: 'add contact identity',
      diagnosticData: args,
    },
  });

  return cmAddIdentity({contactId: args.contactId, identity: args.identity})
    .then((identity: Identity) => {
      logger.logEvent({
        type: LoggingEventType.AUDIT,
        data: {
          description: 'contact identity added',
          actionType: ActionType.CREATE,
          actionSubType: 'add contact identity',
          data: identity,
          diagnosticData: args,
        },
      });

      return identity;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to add identity to contact ${args.contactId}. Error: ${error}`)));
};
