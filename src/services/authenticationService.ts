import {ConnectionTypeEnum, IBasicConnection, IDidAuthConfig, IOpenIdConfig} from '@sphereon/ssi-sdk-data-store-common'
import {IAuthenticatedEntity, IAuthentication, IOpenIdAuthentication} from '../@types/store/authenticate.types'
import {siopGetRequest} from '../providers/authentication/SIOPv2Provider'
import OpenIdConnectProvider from '../providers/authentication/OpenIdConnectProvider'
import store from '../store'
import { CustomApproval } from '../types'
import { IAuthenticatedEntity, IAuthentication, IOpenIdAuthentication } from '../types/store/authenticate.types'
import {scanFingerPrint} from '../utils/BiometricUtils'

export const authenticate = async (
  connection: IBasicConnection,
): Promise<IAuthentication> => {
  return scanFingerPrint().then(() => {
    switch (connection.type) {
      case ConnectionTypeEnum.OPENID:
        return new OpenIdConnectProvider().authenticate(connection.config as IOpenIdConfig)
      case ConnectionTypeEnum.SIOPV2_OIDC4VP:
        return siopGetRequest(connection.config as IDidAuthConfig)
      default:
        return Promise.reject(Error(`No supported authentication provider for type: ${connection.type}`))
    }
  })
}

export const disconnect = async (entityId: string, connection: IBasicConnection): Promise<void> => {
  // TODO disconnect should be an redux action with a connection id. Which then updates the authentication
  const connectionEntity = store
    .getState()
    .authentication.entities.find((entity: IAuthenticatedEntity) => entity.entityId === entityId)
  if (!connectionEntity) {
    return Promise.reject(Error(`No authentication found for entity id: ${entityId}`))
  }

  switch (connection.type) {
    case ConnectionTypeEnum.OPENID: {
      return new OpenIdConnectProvider().revokeToken(
        connection.config as IOpenIdConfig,
        (connectionEntity.authentication as IOpenIdAuthentication).accessToken
      )
    }

    case ConnectionTypeEnum.DIDAUTH:
    case ConnectionTypeEnum.SIOPV2_OIDC4VP: {
      // fixme: We really should not modify the state in this way
      const index = store.getState().authentication.entities.indexOf(connectionEntity)
      index !== -1 && store.getState().authentication.entities.splice(index, 1)
      return
    }
    default:
      return Promise.reject(Error(`No supported authentication provider for type: ${connection.type}`))
  }
}
