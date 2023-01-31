import { IConnection, IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'
import Debug from 'debug'

import { APP_ID } from '../@config/constants'
import { IAddIdentityArgs, ICreateContactArgs, IGetContactsArgs } from '../@types'
import { cmAddConnection, cmAddParty, cmGetParties } from '../agent'

const debug = Debug(`${APP_ID}:contactService`)

export const getContacts = async (args?: IGetContactsArgs): Promise<Array<IConnectionParty>> => {
  debug(`getContacts(${JSON.stringify(args)})...`)
  return cmGetParties(args)
}

export const createContact = async (args: ICreateContactArgs): Promise<IConnectionParty> => {
  debug(`createContact(${JSON.stringify(args)})...`)
  return cmAddParty(args)
    .then((contact: IConnectionParty) => {
      debug(`createContact(${JSON.stringify(args)}) succeeded`)
      return contact
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to create contact. Error: ${error}`)))
}

export const addIdentity = async (args: IAddIdentityArgs): Promise<IConnection> => {
  debug(`addIdentity(${JSON.stringify(args)})...`)
  return cmAddConnection({ partyId: args.contactId, connection: args.connection })
    .then((connection: IConnection) => {
      debug(`addIdentity(${JSON.stringify(connection)}) succeeded`)
      return connection
    })
    .catch((error: Error) =>
      Promise.reject(Error(`Unable to add identity to contact ${args.contactId}. Error: ${error}`))
    )
}
