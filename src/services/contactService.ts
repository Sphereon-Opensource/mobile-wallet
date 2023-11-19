import {IRemoveContactArgs} from '@sphereon/ssi-sdk.contact-manager';
import {IContact, IIdentity} from '@sphereon/ssi-sdk.data-store';
import Debug, {Debugger} from 'debug';

import {APP_ID} from '../@config/constants';
import {cmAddContact, cmAddIdentity, cmGetContacts, cmRemoveContact, cmUpdateContact} from '../agent';
import {IAddIdentityArgs, ICreateContactArgs, IGetContactsArgs, IUpdateContactArgs} from '../types';

const debug: Debugger = Debug(`${APP_ID}:contactService`);

export const getContacts = async (args?: IGetContactsArgs): Promise<Array<IContact>> => {
  debug(`getContacts(${JSON.stringify(args)})...`);
  return await cmGetContacts(args);
};

export const createContact = async (args: ICreateContactArgs): Promise<IContact> => {
  debug(`createContact(${JSON.stringify(args)})...`);
  return cmAddContact(args)
    .then((contact: IContact) => {
      debug(`createContact(${JSON.stringify(args)}) succeeded`);
      return contact;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to create contact. Error: ${error}`)));
};

export const updateContact = async (args: IUpdateContactArgs): Promise<IContact> => {
  debug(`updateContact(${JSON.stringify(args)})...`);
  return cmUpdateContact(args)
    .then((contact: IContact) => {
      debug(`updateContact(${JSON.stringify(args)}) succeeded`);
      return contact;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to update contact. Error: ${error}`)));
};

export const removeContact = async (args: IRemoveContactArgs): Promise<boolean> => {
  debug(`removeContact(${JSON.stringify(args)})...`);
  return cmRemoveContact(args)
    .then((isDeleted: boolean) => {
      debug(`removeContact(${JSON.stringify(args)}) succeeded`);
      return isDeleted;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to remove contact. Error: ${error}`)));
};

export const addIdentity = async (args: IAddIdentityArgs): Promise<IIdentity> => {
  debug(`addIdentity(${JSON.stringify(args)})...`);
  return cmAddIdentity({contactId: args.contactId, identity: args.identity})
    .then((identity: IIdentity) => {
      debug(`addIdentity(${JSON.stringify(identity)}) succeeded`);
      return identity;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to add identity to contact ${args.contactId}. Error: ${error}`)));
};
