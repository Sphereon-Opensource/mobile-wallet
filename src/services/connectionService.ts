import {
  ConnectionIdentifierEnum,
  ConnectionTypeEnum,
  IBasicConnection,
  IBasicConnectionIdentifier,
  IBasicConnectionMetadataItem,
  IBasicDidAuthConfig,
  IBasicOpenIdConfig,
  IConnection,
  IConnectionParty
} from '@sphereon/ssi-sdk-data-store-common'
import Debug from 'debug'

import { APP_ID } from '../@config/constants'
import { cmAddConnection, cmAddParty, cmGetParties, cmGetParty } from '../agent'

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
    cmGetParties()
      .then((parties: Array<IConnectionParty>) => {
        debug(`getConnectionParties() succeeded`)
        return parties
      })
      .catch((error: Error) => Promise.reject(Error(`Unable to retrieve connection parties. Error: ${error}`)))
  )
}

export const addConnectionParty = async (partyName: string): Promise<IConnectionParty> => {
  debug(`addConnectionParty(${partyName})...`)
  return cmAddParty({ name: partyName })
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
  identifier: IBasicConnectionIdentifier
  config: IBasicDidAuthConfig | IBasicOpenIdConfig
  metadata?: Array<IBasicConnectionMetadataItem>
}): IBasicConnection => {
  return {
    type: args.type,
    identifier: args.identifier,
    config: args.config,
    metadata: args.metadata
      ? args.metadata.map((item: IBasicConnectionMetadataItem) => {
          return { ...item, id: uuidv4() }
        })
      : []
  }
}

// TODO this should be refactored to some build config https://www.npmjs.com/package/react-native-build-config
const addDefaultConnections = async () => {
  debug(`addDefaultConnections()...`)

  const parties = await cmGetParties()
  const sphereonName = 'Sphereon'
  const sphereon = parties.find((party: IConnectionParty) => party.name === sphereonName)
  if (!sphereon) {
    debug(`addDefaultConnections(): Sphereon connection not present. Will add...`)
    await cmAddParty({ name: sphereonName }).then(async (party: IConnectionParty) => {
      if (!party) {
        return Promise.reject(`Could not add default 'sphereon' connection`)
      }

      const connection = {
        type: ConnectionTypeEnum.OPENID,
        identifier: {
          type: ConnectionIdentifierEnum.URL,
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

  const firm24Name = 'Firm24'
  const firm24 = parties.find((party: IConnectionParty) => party.name === firm24Name)
  if (!firm24) {
    debug(`addDefaultConnections(): Firm24 connection not present. Will add...`)
    await cmAddParty({ name: firm24Name }).then(async (party: IConnectionParty) => {
      if (!party) {
        return Promise.reject(`Could not add default 'firm24' connection`)
      }

      const connection = {
        type: ConnectionTypeEnum.OPENID,
        identifier: {
          type: ConnectionIdentifierEnum.URL,
          correlationId: 'https://shr.docarama.com/api/oidc/'
        },
        config: {
          clientId: 'sphereon',
          clientSecret: '261b1e80-7e30-42c9-afde-6403f9f4ec19',
          // TODO we can either pass in an issuer or serviceConfiguration
          issuer: 'https://shr.docarama.com/api/oidc/', // TODO should also only have serviceConfiguration
          serviceConfiguration: {
            authorizationEndpoint: 'https://shr.docarama.com/api/oidc/auth',
            tokenEndpoint: 'https://shr.docarama.com/api/oidc/token'
          },
          redirectUrl: 'com.sphereon.ssi.wallet:/callback',
          dangerouslyAllowInsecureHttpRequests: true,
          clientAuthMethod: 'post' as const,
          scopes: ['openid', 'organizations', 'session']
        },
        metadata: [
          {
            label: 'Connection URL',
            value: 'https://shr.docarama.com'
          }
        ]
      }
      const firm24Connection = await cmAddConnection({ partyId: party.id, connection })
      debug(`Firm24 connection received id ${firm24Connection.id}`)
    })
  }
  debug(`addDefaultConnections(): done`)
}
