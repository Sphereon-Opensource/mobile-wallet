import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'

import { IStorePinArgs } from '../@types'

const STORAGE_PIN_KEY = 'pin'

export const storePin = async ({ value, accessible = ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY }: IStorePinArgs): Promise<any> => {
  return RNSecureKeyStore.set(STORAGE_PIN_KEY, value, { accessible })
}

export const getPin = async (): Promise<string> => {
  return RNSecureKeyStore.get(STORAGE_PIN_KEY)
    .catch(() => Promise.reject(new Error(`Value not found for key: ${STORAGE_PIN_KEY}`)))
}
