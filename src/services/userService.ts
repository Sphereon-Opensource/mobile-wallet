import Debug from 'debug'

import { APP_ID } from '../@config/constants'
import { IUser } from '../@types'

import { getUser as getUserFromStorage, storeUser } from './storageService'

const debug = Debug(`${APP_ID}:userService`)

const { v4: uuidv4 } = require('uuid')

export const createUser = async (args: Omit<IUser, 'id'>): Promise<IUser> => {
  debug(`createUser(${JSON.stringify(args)})...`)
  const user: IUser = { ...args, id: uuidv4() }
  return storeUser({ user })
    .then(() => {
      debug(`createUser(${JSON.stringify(args)}) succeeded`)
      return user
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to create user. Error: ${error}`)))
}

export const getUser = async (): Promise<IUser> => {
  debug(`getUser...`)
  return getUserFromStorage().catch((error: Error) =>
    Promise.reject(Error(`Unable to retrieve user from storage. Error: ${error.message}`))
  )
}
