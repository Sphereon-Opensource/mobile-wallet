import { IConnection, IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'
import Debug from 'debug'

import { APP_ID } from '../@config/constants'
import { IAddConnectionArgs, ICreateContactArgs } from '../@types/services'
import { cmAddConnection, cmAddParty, cmGetParties } from '../agent'

const debug = Debug(`${APP_ID}:contactService`)

export const getContactsFromStorage = async (): Promise<Array<IConnectionParty>> => {
  return cmGetParties()

  // return [
  //   {
  //     id: '0eee7ef0-162a-40ef-b420-ae36e04d3c41',
  //     name: 'Henk de Vries',
  //     alias: 'Henkie',
  //     uri: 'something://something_else.anything',
  //     role: 'Verifier',
  //     connections: [
  //       {
  //         entityId: '1654a95c-896d-4e74-b290-b72fe4b3cdws1',
  //         entityName: 'Sphereon',
  //         connection: {
  //           id: '1654a95c-896d-4e74-b290-b72fe4b3cac1',
  //           type: ConnectionTypeEnum.OPENID,
  //           identifier: {
  //             id: 'f2c4be7f-0b25-4555-b371-de2e16e5ed41',
  //             type: ConnectionIdentifierEnum.DID,
  //             correlationId: 'f6807dbb-b6e5-4586-935a-c9cc504b0d29'
  //           },
  //           config: {
  //             id: '1f8d8def-95d6-47b4-a0fe-1dd18c6627a1',
  //             clientId: 'fde45c3f-3fe3-4b37-911b-696631b5c10c',
  //             clientSecret: '0d33e2ed-580c-4ace-a99f-c40db80348c4',
  //             scopes: [],
  //             issuer: 'Sphereon',
  //             redirectUrl: 'example.com',
  //             dangerouslyAllowInsecureHttpRequests: false,
  //             clientAuthMethod: 'post'
  //           },
  //           createdAt: new Date(),
  //           lastUpdatedAt: new Date()
  //         },
  //         connectionStatus: ConnectionStatusEnum.DISCONNECTED
  //       },
  //       {
  //         entityId: '1654a95c-896d-4e74-b290-b72fe4b3cdws2',
  //         entityName: 'Sphereon',
  //         connection: {
  //           id: '1654a95c-896d-4e74-b290-b72fe4b3cac2',
  //           type: ConnectionTypeEnum.OPENID,
  //           identifier: {
  //             id: 'f2c4be7f-0b25-4555-b371-de2e16e5ed42',
  //             type: ConnectionIdentifierEnum.DID,
  //             correlationId: 'f6807dbb-b6e5-4586-935a-c9cc504b0d29'
  //           },
  //           config: {
  //             id: '1f8d8def-95d6-47b4-a0fe-1dd18c6627a2',
  //             clientId: 'fde45c3f-3fe3-4b37-911b-696631b5c10c',
  //             clientSecret: '0d33e2ed-580c-4ace-a99f-c40db80348c4',
  //             scopes: [],
  //             issuer: 'Sphereon',
  //             redirectUrl: 'example.com',
  //             dangerouslyAllowInsecureHttpRequests: false,
  //             clientAuthMethod: 'post'
  //           },
  //           createdAt: new Date(),
  //           lastUpdatedAt: new Date()
  //         },
  //         connectionStatus: ConnectionStatusEnum.DISCONNECTED
  //       }
  //     ]
  //   }
  // ]
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
