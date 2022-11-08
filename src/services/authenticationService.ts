import { SIOP } from '@sphereon/did-auth-siop'
import {
  ConnectionTypeEnum,
  IBasicConnection,
  IDidAuthConfig,
  IOpenIdConfig
} from '@sphereon/ssi-sdk-data-store-common'

import { CustomApproval } from '../@types'
import DidAuthSiopProvider from '../providers/authentication/DidAuthSiopProvider'
import OpenIdConnectProvider from '../providers/authentication/OpenIdConnectProvider'
import store from '../store'
import { IAuthenticatedEntity, IAuthentication, IOpenIdAuthentication } from '../store/types/authenticate.types'
import { scanFingerPrint } from '../utils/BiometricUtils'

export const authenticate = async (
  connection: IBasicConnection,
  customApproval?: CustomApproval
): Promise<IAuthentication> => {
  return scanFingerPrint().then(() => {
    switch (connection.type) {
      case ConnectionTypeEnum.OPENID:
        return new OpenIdConnectProvider().authenticate(connection.config as IOpenIdConfig)
      case ConnectionTypeEnum.DIDAUTH:
        return new DidAuthSiopProvider().authenticate(connection.config as IDidAuthConfig, customApproval)
      default:
        return Promise.reject(Error(`No supported authentication provider for type: ${connection.type}`))
    }
  })
}

export const disconnect = async (entityId: string, connection: IBasicConnection): Promise<void> => {
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
    // TODO can we disconnect such connections? do we have a token somewhere we can revoke?
    // case ConnectionTypeEnum.DIDAUTH: {
    //   const token = (connectionEntity.authentication as Response).token
    //   return new DidAuthSiopProvider().revokeToken(connection.config as IDidAuthConfig, token)
    // }
    default:
      return Promise.reject(Error(`No supported authentication provider for type: ${connection.type}`))
  }
}

// TODO refactor to support other cases
export const verifyAuthentication = (
  connectionType: ConnectionTypeEnum,
  args: {
    sessionId: string
    verifiedAuthenticationRequest: SIOP.VerifiedAuthenticationRequestWithJWT
  }
) => {
  switch (connectionType) {
    case ConnectionTypeEnum.DIDAUTH:
      return new DidAuthSiopProvider().verifyAuthentication(args.sessionId, args.verifiedAuthenticationRequest)
    default:
      return Promise.reject(Error(`No supported authentication provider for type: ${connectionType}`))
  }
}
