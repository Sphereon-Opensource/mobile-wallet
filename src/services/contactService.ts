import {
  BasicCorrelationIdentifier,
  BasicMetadataItem,
  IBasicConnection,
  IBasicIdentity,
  IContact,
  IIdentity
} from '@sphereon/ssi-sdk-data-store'
import Debug from 'debug'

import { APP_ID } from '../@config/constants'
import { cmAddContact, cmAddIdentity, cmGetContacts } from '../agent'
import { IAddIdentityArgs, ICreateContactArgs, IGetContactsArgs } from '../types'

const { v4: uuidv4 } = require('uuid')

const debug = Debug(`${APP_ID}:contactService`)

export const getContacts = async (args?: IGetContactsArgs): Promise<Array<IContact>> => {
  debug(`getContacts(${JSON.stringify(args)})...`)
  return cmGetContacts(args)
}

export const createContact = async (args: ICreateContactArgs): Promise<IContact> => {
  debug(`createContact(${JSON.stringify(args)})...`)
  return cmAddContact(args)
    .then((contact: IContact) => {
      debug(`createContact(${JSON.stringify(args)}) succeeded`)
      return contact
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to create contact. Error: ${error}`)))
}

export const addIdentity = async (args: IAddIdentityArgs): Promise<IIdentity> => {
  debug(`addIdentity(${JSON.stringify(args)})...`)
  return cmAddIdentity({ contactId: args.contactId, identity: args.identity })
    .then((identity: IIdentity) => {
      debug(`addIdentity(${JSON.stringify(identity)}) succeeded`)
      return identity
    })
    .catch((error: Error) =>
      Promise.reject(Error(`Unable to add identity to contact ${args.contactId}. Error: ${error}`))
    )
}

export const identityFrom = (args: {
  alias: string
  identifier: BasicCorrelationIdentifier
  connection?: IBasicConnection
  metadata?: Array<BasicMetadataItem>
}): IBasicIdentity => {
  return {
    alias: args.identifier.correlationId,
    identifier: args.identifier,
    connection: args.connection,
    metadata: args.metadata
      ? args.metadata.map((item: BasicMetadataItem) => {
        return { ...item, id: uuidv4() }
      })
      : []
  }
}
