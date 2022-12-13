import { IConnection, IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'
import Debug from 'debug'

import { APP_ID } from '../@config/constants'
import { IAddConnectionArgs, ICreateContactArgs } from '../@types/services'
import { cmAddConnection, cmAddParty, cmGetParties } from '../agent'

const debug = Debug(`${APP_ID}:contactService`)

export const getContactsFromStorage = async (): Promise<Array<IConnectionParty>> => {
  return cmGetParties()
}

export const createContact = async (args: ICreateContactArgs): Promise<IConnectionParty> => {
  debug(`createContact(${JSON.stringify(args)})...`)
  return cmAddParty(args).then((contact: IConnectionParty) => {
      debug(`createContact(${JSON.stringify(args)}) succeeded`)
      return contact
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to create contact. Error: ${error}`)))
}

export const addConnection = async (args: IAddConnectionArgs): Promise<IConnection> => {
  debug(`addConnection(${JSON.stringify(args)})...`)
  return cmAddConnection({ partyId: args.contactId, connection: args.connection }).then((connection: IConnection) => {
    debug(`addConnection(${JSON.stringify(connection)}) succeeded`)
    return connection
  })
  .catch((error: Error) => Promise.reject(Error(`Unable to add connection to contact ${args.contactId}. Error: ${error}`)))
}
