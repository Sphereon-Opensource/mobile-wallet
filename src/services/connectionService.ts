import {
  BasicConnectionIdentifier,
  BasicConnectionMetadataItem,
  BasicDidAuthConfig,
  BasicOpenIdConfig,
  BasicPartyIdentifier,
  ConnectionTypeEnum,
  CorrelationIdentifierEnum,
  IBasicConnection,
  IConnection,
  IConnectionParty
} from '@sphereon/ssi-sdk-data-store-common'
import Debug from 'debug'

import { APP_ID } from '../@config/constants'
import { cmAddConnection, cmAddParty, cmGetParty } from '../agent'

import { getContacts } from './contactService'

const debug = Debug(`${APP_ID}:connectionService`)

const { v4: uuidv4 } = require('uuid')

export const getConnectionParty = async (partyId: string): Promise<IConnectionParty> => {
  debug(`getConnectionParty(${partyId})...`)
  return cmGetParty({ partyId })
    .then((party: IConnectionParty) => {
      debug(`getConnectionParty(${partyId}) succeeded`)
      return party
    })
    .catch((error: Error) =>
      Promise.reject(Error(`Unable to retrieve connection party for id ${partyId}. Error: ${error}`))
    )
}

export const getConnectionParties = async (): Promise<Array<IConnectionParty>> => {
  // TODO this should be refactored to some build config https://www.npmjs.com/package/react-native-build-config
  debug(`getConnectionParties()...`)
  return addDefaultConnections().then(() =>
    getContacts()
      .then((parties: Array<IConnectionParty>) => {
        debug(`getConnectionParties() succeeded`)
        return parties
      })
      .catch((error: Error) => Promise.reject(Error(`Unable to retrieve connection parties. Error: ${error}`)))
  )
}

export const addConnectionParty = async (
  partyName: string,
  identifier: BasicPartyIdentifier
): Promise<IConnectionParty> => {
  debug(`addConnectionParty(${partyName})...`)
  return cmAddParty({ name: partyName, alias: partyName, identifier: identifier })
    .then((party: IConnectionParty) => {
      debug(`addConnectionParty(${partyName}) succeeded`)
      return party
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to add connection party. Error: ${error}`)))
}

export const addConnectionToParty = async (partyId: string, connection: IConnection): Promise<IConnection> => {
  debug(`addConnectionToParty(${partyId}, <connection-object>)...`)
  return cmAddConnection({ partyId, connection })
    .then((connection: IConnection) => {
      debug(`addConnectionToParty(${partyId}, <connection-object>) succeeded`)
      return connection
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to add connection to party ${partyId}. Error: ${error}`)))
}

export const connectFrom = (args: {
  type: ConnectionTypeEnum
  identifier: BasicConnectionIdentifier
  config: BasicDidAuthConfig | BasicOpenIdConfig
  metadata?: Array<BasicConnectionMetadataItem>
}): IBasicConnection => {
  return {
    type: args.type,
    identifier: args.identifier,
    config: args.config,
    metadata: args.metadata
      ? args.metadata.map((item: BasicConnectionMetadataItem) => {
          return { ...item, id: uuidv4() }
        })
      : []
  }
}

// TODO this should be refactored to some build config https://www.npmjs.com/package/react-native-build-config
const addDefaultConnections = async () => {
  debug(`addDefaultConnections()...`)

  const sphereonName = 'Sphereon'
  const sphereonCorrelationId = 'sphereon.com'
  const partiesSphereon = await getContacts({ filter: [{ identifier: { correlationId: sphereonCorrelationId } }] })
  if (partiesSphereon.length === 0) {
    debug(`addDefaultConnections(): Sphereon connection not present. Will add...`)
    const party = {
      name: sphereonName,
      alias: sphereonName,
      identifier: {
        type: CorrelationIdentifierEnum.URL,
        correlationId: sphereonCorrelationId
      }
    }

    await cmAddParty(party).then(async (party: IConnectionParty) => {
      if (!party) {
        return Promise.reject(`Could not add default 'sphereon' connection`)
      }

      const connection = {
        type: ConnectionTypeEnum.OPENID,
        identifier: {
          type: CorrelationIdentifierEnum.URL,
          correlationId: 'https://auth-test.sphereon.com/auth/realms/ssi-wallet'
        },
        config: {
          clientId: 'ssi-wallet',
          clientSecret: '45de05ae-fefb-49a9-962d-46905df7ed65',
          issuer: 'https://auth-test.sphereon.com/auth/realms/ssi-wallet',
          serviceConfiguration: {
            authorizationEndpoint: 'https://auth-test.sphereon.com/auth/realms/ssi-wallet/protocol/openid-connect/auth',
            tokenEndpoint: 'https://auth-test.sphereon.com/auth/realms/ssi-wallet/protocol/openid-connect/token'
          },
          redirectUrl: 'com.sphereon.ssi.wallet:/callback',
          dangerouslyAllowInsecureHttpRequests: true,
          clientAuthMethod: 'post' as const,
          scopes: ['openid']
        },
        metadata: [
          {
            label: 'Connection URL',
            value: 'https://auth-test.sphereon.com'
          }
        ]
      }
      const sphereonTestConnection = await cmAddConnection({ partyId: party.id, connection })
      debug(
        `Sphereon connection received id ${sphereonTestConnection.id} at ${sphereonTestConnection.createdAt}, config ${sphereonTestConnection.config}`
      )
    })
  }
}
