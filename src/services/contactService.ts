import {IRemoveContactArgs} from '@sphereon/ssi-sdk.contact-manager';
import {
  BasicCorrelationIdentifier,
  BasicMetadataItem,
  IBasicConnection,
  IBasicIdentity,
  IContact,
  IdentityRoleEnum,
  IIdentity,
} from '@sphereon/ssi-sdk.data-store';
import Debug from 'debug';

import {APP_ID} from '../@config/constants';
import {cmAddContact, cmAddIdentity, cmGetContacts, cmGetIdentities, cmRemoveContact, cmUpdateContact} from '../agent';
import {IAddIdentityArgs, ICreateContactArgs, IGetContactsArgs, IGetIdentitiesArgs, IUpdateContactArgs} from '../types';

const {v4: uuidv4} = require('uuid');

const debug: Debug.Debugger = Debug(`${APP_ID}:contactService`);

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

export const getIdentities = async (args?: IGetIdentitiesArgs): Promise<Array<IIdentity>> => {
  debug(`getIdentities(${JSON.stringify(args)})...`);
  return await cmGetIdentities(args);
};

export const identityFrom = (args: {
  alias: string;
  roles: Array<IdentityRoleEnum>;
  identifier: BasicCorrelationIdentifier;
  connection?: IBasicConnection;
  metadata?: Array<BasicMetadataItem>;
}): IBasicIdentity => {
  return {
    alias: args.alias,
    roles: args.roles,
    identifier: args.identifier,
    connection: args.connection,
    metadata: args.metadata ? args.metadata.map((item: BasicMetadataItem) => ({...item, id: uuidv4()})) : [],
  };
};
