import {MMKVLoader, IOSAccessibleStates} from 'react-native-mmkv-storage';
import Debug, {Debugger} from 'debug';

import {APP_ID} from '../@config/constants';
import {IStorePinArgs, IStoreUserArgs, IUser} from '../types';

const debug: Debugger = Debug(`${APP_ID}:storageService`);

const STORAGE_PIN_KEY = 'pin';
// TODO: With the new storage solution we can use individual items per user
const STORAGE_USERS_KEY = 'users';

const userStorage = new MMKVLoader()
  .withEncryption()
  .setAccessibleIOS(IOSAccessibleStates.WHEN_UNLOCKED_THIS_DEVICE_ONLY)
  .withInstanceID('sphereon-wallet-users-v0.3')
  .initialize();
const pinStorage = new MMKVLoader()
  .withEncryption()
  .setAccessibleIOS(IOSAccessibleStates.WHEN_UNLOCKED_THIS_DEVICE_ONLY)
  .withInstanceID('sphereon-wallet-pin-v0.3')
  .initialize();

export const storagePersistUser = async ({user}: IStoreUserArgs): Promise<void> => {
  debug(`storeUser(${JSON.stringify(user)})...`);

  await userStorage
    .getStringAsync(STORAGE_USERS_KEY)
    .then(result => {
      if (!result || result === '{}') {
        debug(`storeUser(${JSON.stringify(user)}) no users found`);
        const users = new Map<string, IUser>();
        users.set(user.id, user);

        return userStorage.setString(STORAGE_USERS_KEY, JSON.stringify(Array.from(users)));
      }

      debug(`storeUser(${JSON.stringify(user)}) users found`);
      const users: Map<string, IUser> = new Map<string, IUser>();
      JSON.parse(result).forEach(([key, value]: [string, IUser]) => {
        users.set(key, value);
      });

      users.set(user.id, user);

      debug(`storeUser(${JSON.stringify(user)}) storing user`);
      userStorage.setString(STORAGE_USERS_KEY, JSON.stringify(Array.from(users)));
    })
    .catch((error: Error) => Promise.reject(new Error(`Unable to set value for key: ${STORAGE_PIN_KEY}. ${error.message}`)));
};

export const storageGetUsers = async (): Promise<Map<string, IUser>> => {
  debug(`getUsers...`);
  return await userStorage
    .getStringAsync(STORAGE_USERS_KEY)
    .then(result => {
      if (!result || result === '{}') {
        debug(`getUsers() no users found`);
        return new Map<string, IUser>();
      }

      debug(`getUsers() users found`);
      const users: Map<string, IUser> = new Map<string, IUser>();
      JSON.parse(result).forEach(([key, value]: [string, IUser]) => {
        users.set(key, value);
      });

      return users;
    })
    .catch((error: Error) => Promise.reject(new Error(`Unable to retrieve value for key: ${STORAGE_USERS_KEY}. ${error.message}`)));
};

export const storageDeleteUser = async (userId: string): Promise<void> => {
  debug(`deleteUser(${userId})...`);

  await userStorage
    .getStringAsync(STORAGE_USERS_KEY)
    .then(result => {
      if (!result || result === '{}') {
        debug(`deleteUser(${userId}) no users found`);
        return;
      }

      const users: Map<string, IUser> = new Map<string, IUser>();
      JSON.parse(result).forEach(([key, value]: [string, IUser]) => {
        users.set(key, value);
      });

      debug(`deleteUser(${userId}) deleting user`);
      users.delete(userId);

      userStorage.setString(STORAGE_USERS_KEY, JSON.stringify(Array.from(users)));
    })
    .catch((error: Error) => Promise.reject(new Error(`Unable to set value for key: ${STORAGE_PIN_KEY}. ${error.message}`)));
};

export const storagePersistPin = async ({value}: IStorePinArgs): Promise<any> => {
  console.log(`storePin...`);
  return await pinStorage.setStringAsync(STORAGE_PIN_KEY, value);
};

export const storageGetPin = async (): Promise<string> => {
  debug(`getPin...`);
  const value = await pinStorage.getStringAsync(STORAGE_PIN_KEY);
  if (!value) {
    return Promise.reject(new Error(`Value not found for key: ${STORAGE_PIN_KEY}`));
  }
  return value;
};

export const storageDeletePin = async (): Promise<boolean> => {
  debug(`deletePin...`);
  return pinStorage.removeItem(STORAGE_PIN_KEY);
};

export const storageHasPin = (): boolean => {
  debug(`hasPin...`);
  const result = !!pinStorage.getString(STORAGE_PIN_KEY);
  debug(`hasPin: ${JSON.stringify(result)}`);
  return result;
};
