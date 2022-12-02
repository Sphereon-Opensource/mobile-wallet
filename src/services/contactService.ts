import { ConnectionIdentifierEnum, ConnectionTypeEnum } from '@sphereon/ssi-sdk-data-store-common'

import { ConnectionStatusEnum, IContact } from '../@types'

export const getContactsFromStorage = async (): Promise<Array<IContact>> => {
  return [
    {
      id: '0eee7ef0-162a-40ef-b420-ae36e04d3c41',
      name: 'Henk de Vries',
      alias: 'Henkie',
      uri: 'something://something_else.anything',
      role: 'Verifier',
      connections: [
        {
          entityId: '1654a95c-896d-4e74-b290-b72fe4b3cdws1',
          entityName: 'Sphereon',
          connection: {
            id: '1654a95c-896d-4e74-b290-b72fe4b3cac1',
            type: ConnectionTypeEnum.OPENID,
            identifier: {
              id: 'f2c4be7f-0b25-4555-b371-de2e16e5ed41',
              type: ConnectionIdentifierEnum.DID,
              correlationId: 'f6807dbb-b6e5-4586-935a-c9cc504b0d29'
            },
            config: {
              id: '1f8d8def-95d6-47b4-a0fe-1dd18c6627a1',
              clientId: 'fde45c3f-3fe3-4b37-911b-696631b5c10c',
              clientSecret: '0d33e2ed-580c-4ace-a99f-c40db80348c4',
              scopes: [],
              issuer: 'Sphereon',
              redirectUrl: 'example.com',
              dangerouslyAllowInsecureHttpRequests: false,
              clientAuthMethod: 'post'
            },
            createdAt: new Date(),
            lastUpdatedAt: new Date()
          },
          connectionStatus: ConnectionStatusEnum.DISCONNECTED
        },
        {
          entityId: '1654a95c-896d-4e74-b290-b72fe4b3cdws2',
          entityName: 'Sphereon',
          connection: {
            id: '1654a95c-896d-4e74-b290-b72fe4b3cac2',
            type: ConnectionTypeEnum.OPENID,
            identifier: {
              id: 'f2c4be7f-0b25-4555-b371-de2e16e5ed42',
              type: ConnectionIdentifierEnum.DID,
              correlationId: 'f6807dbb-b6e5-4586-935a-c9cc504b0d29'
            },
            config: {
              id: '1f8d8def-95d6-47b4-a0fe-1dd18c6627a2',
              clientId: 'fde45c3f-3fe3-4b37-911b-696631b5c10c',
              clientSecret: '0d33e2ed-580c-4ace-a99f-c40db80348c4',
              scopes: [],
              issuer: 'Sphereon',
              redirectUrl: 'example.com',
              dangerouslyAllowInsecureHttpRequests: false,
              clientAuthMethod: 'post'
            },
            createdAt: new Date(),
            lastUpdatedAt: new Date()
          },
          connectionStatus: ConnectionStatusEnum.DISCONNECTED
        }
      ]
    }
  ]
}
