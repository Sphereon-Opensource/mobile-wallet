import Debug, {Debugger} from 'debug';

import {APP_ID} from '../@config/constants';
import {BasicUser, BasicUserIdentifier, IUser} from '../types';

import {storageGetUsers, storageDeleteUser, storagePersistUser} from './storageService';

const debug: Debugger = Debug(`${APP_ID}:userService`);

import {v4 as uuidv4} from 'uuid';

export const createUser = async (args: BasicUser): Promise<IUser> => {
  debug(`createUser(${JSON.stringify(args)})...`);
  const user: IUser = {
    ...args,
    id: uuidv4(),
    identifiers: args.identifiers
      ? args.identifiers.map((identifier: BasicUserIdentifier) => ({...identifier, createdAt: new Date(), lastUpdatedAt: new Date()}))
      : [],
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
  };

  return storagePersistUser({user})
    .then(() => {
      debug(`createUser(${JSON.stringify(args)}) succeeded`);
      return user;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to create user. Error: ${error}`)));
};

export const getUsers = async (): Promise<Map<string, IUser>> => {
  debug(`getUsers...`);
  return storageGetUsers().catch((error: Error) => Promise.reject(Error(`Unable to retrieve users from storage. Error: ${error.message}`)));
};

export const updateUser = async (args: IUser): Promise<IUser> => {
  debug(`updateUser(${JSON.stringify(args)})...`);
  const user: IUser = {
    ...args,
    lastUpdatedAt: new Date(),
  };

  return storagePersistUser({user})
    .then(() => {
      debug(`updateUser(${JSON.stringify(args)}) succeeded`);
      return user;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to update user. Error: ${error}`)));
};

export const deleteUser = async (userId: string): Promise<void> => {
  storageDeleteUser(userId).catch((error: Error) => Promise.reject(Error(`Unable to delete user with id: ${userId}. Error: ${error}`)));
};
