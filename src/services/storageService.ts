import AsyncStorage from '@react-native-async-storage/async-storage';
import Debug from 'debug';
import RNSecureKeyStore, {ACCESSIBLE} from 'react-native-secure-key-store';

import {APP_ID} from '../@config/constants';
import {IStorePinArgs, IStoreUserArgs, IUser} from '../types';

const debug: Debug.Debugger = Debug(`${APP_ID}:storageService`);

const STORAGE_PIN_KEY = 'pin';
const STORAGE_USERS_KEY = 'users';

export const storagePersistUser = async ({user}: IStoreUserArgs): Promise<void> => {
  debug(`storeUser(${JSON.stringify(user)})...`);

  await AsyncStorage.getItem(STORAGE_USERS_KEY)
    .then((result: string | null) => {
      if (!result || result === '{}') {
        debug(`storeUser(${JSON.stringify(user)}) no users found`);
        const users = new Map<string, IUser>();
        users.set(user.id, user);

        return AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(Array.from(users)));
      }

      debug(`storeUser(${JSON.stringify(user)}) users found`);
      const users: Map<string, IUser> = new Map<string, IUser>();
      JSON.parse(result).forEach(([key, value]: [string, IUser]) => {
        users.set(key, value);
      });

      users.set(user.id, user);

      debug(`storeUser(${JSON.stringify(user)}) storing user`);
      AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(Array.from(users)));
    })
    .catch((error: Error) => Promise.reject(new Error(`Unable to set value for key: ${STORAGE_PIN_KEY}. ${error.message}`)));
};

export const storageGetUsers = async (): Promise<Map<string, IUser>> => {
  debug(`getUsers...`);
  return await AsyncStorage.getItem(STORAGE_USERS_KEY)
    .then((result: string | null) => {
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

  await AsyncStorage.getItem(STORAGE_USERS_KEY)
    .then((result: string | null) => {
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

      AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(Array.from(users)));
    })
    .catch((error: Error) => Promise.reject(new Error(`Unable to set value for key: ${STORAGE_PIN_KEY}. ${error.message}`)));
};

export const storagePersistPin = async ({value, accessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY}: IStorePinArgs): Promise<any> => {
  console.log(`storePin...`);
  return RNSecureKeyStore.set(STORAGE_PIN_KEY, value, {accessible});
};

export const storageGetPin = async (): Promise<string> => {
  debug(`getPin...`);
  return RNSecureKeyStore.get(STORAGE_PIN_KEY).catch(() => Promise.reject(new Error(`Value not found for key: ${STORAGE_PIN_KEY}`)));
};

export const storageDeletePin = async (): Promise<void> => {
  debug(`deletePin...`);
  return RNSecureKeyStore.remove(STORAGE_PIN_KEY).catch(() => Promise.reject(new Error(`Unable to remove value for key: ${STORAGE_PIN_KEY}`)));
};
