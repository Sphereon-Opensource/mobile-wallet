import AsyncStorage from '@react-native-async-storage/async-storage'
import Debug from 'debug'
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'

import { APP_ID } from '../@config/constants'
import { IStorePinArgs, IStoreUserArgs, IUser } from '../types'

const debug = Debug(`${APP_ID}:storageService`)

const STORAGE_PIN_KEY = 'pin'
const STORAGE_USERS_KEY = 'users'

export const storePin = async ({
  value,
  accessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
}: IStorePinArgs): Promise<any> => {
  debug(`storePin...`)
  return RNSecureKeyStore.set(STORAGE_PIN_KEY, value, { accessible })
}

export const getPin = async (): Promise<string> => {
  debug(`getPin...`)
  return RNSecureKeyStore.get(STORAGE_PIN_KEY).catch(() =>
    Promise.reject(new Error(`Value not found for key: ${STORAGE_PIN_KEY}`))
  )
}

export const storeUser = async ({ user }: IStoreUserArgs): Promise<void> => {
  debug(`storeUser(${JSON.stringify(user)})...`)
  const users_value = await AsyncStorage.getItem(STORAGE_USERS_KEY)
  if (users_value === null) {
    const users = new Map<string, IUser>()
    users.set(user.id, user)

    return AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
  }

  const users: Map<string, IUser> = JSON.parse(users_value)
  users.set(user.id, user)

  return AsyncStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
}

export const getUsers = async (): Promise<Map<string, IUser>> => {
  debug(`getUsers...`)
  return AsyncStorage.getItem(STORAGE_USERS_KEY)
    .then((result: string | null) => {
      if (!result) {
        return Promise.reject(new Error(`Value not found for key: ${STORAGE_USERS_KEY}`))
      }

      return JSON.parse(result)
    })
    .catch(() => Promise.reject(new Error(`Value not found for key: ${STORAGE_USERS_KEY}`)))
}
