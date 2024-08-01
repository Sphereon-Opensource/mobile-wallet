import {RemoveContactArgs} from '@sphereon/ssi-sdk.contact-manager';
import {Party, Identity} from '@sphereon/ssi-sdk.data-store';
import Debug, {Debugger} from 'debug';

import {APP_ID} from '../@config/constants';
import {IAddIdentityArgs, ICreateContactArgs, IGetContactsArgs, IRequiredContext, IUpdateContactArgs} from '../types';

const debug: Debugger = Debug(`${APP_ID}:contactService`);

export const getContacts = async (args: IGetContactsArgs, context: IRequiredContext): Promise<Array<Party>> => {
  debug(`getContacts(${JSON.stringify(args)})...`);
  return await context.agent.cmGetContacts(args);
};

export const createContact = async (args: ICreateContactArgs, context: IRequiredContext): Promise<Party> => {
  debug(`createContact(${JSON.stringify(args)})...`);
  return context.agent
    .cmAddContact(args)
    .then((contact: Party) => {
      debug(`createContact(${JSON.stringify(args)}) succeeded`);
      return contact;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to create contact. Error: ${error}`)));
};

export const updateContact = async (args: IUpdateContactArgs, context: IRequiredContext): Promise<Party> => {
  debug(`updateContact(${JSON.stringify(args)})...`);
  return context.agent
    .cmUpdateContact(args)
    .then((contact: Party) => {
      debug(`updateContact(${JSON.stringify(args)}) succeeded`);
      return contact;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to update contact. Error: ${error}`)));
};

export const removeContact = async (args: RemoveContactArgs, context: IRequiredContext): Promise<boolean> => {
  debug(`removeContact(${JSON.stringify(args)})...`);
  return context.agent
    .cmRemoveContact(args)
    .then((isDeleted: boolean) => {
      debug(`removeContact(${JSON.stringify(args)}) succeeded`);
      return isDeleted;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to remove contact. Error: ${error}`)));
};

export const addIdentity = async (args: IAddIdentityArgs, context: IRequiredContext): Promise<Identity> => {
  debug(`addIdentity(${JSON.stringify(args)})...`);
  return context.agent
    .cmAddIdentity({contactId: args.contactId, identity: args.identity})
    .then((identity: Identity) => {
      debug(`addIdentity(${JSON.stringify(identity)}) succeeded`);
      return identity;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to add identity to contact ${args.contactId}. Error: ${error}`)));
};
