import {
  ConnectionTypeEnum,
  IBasicIdentity,
  IDidAuthConfig,
  IOpenIdConfig
} from '@sphereon/ssi-sdk-data-store'

import OpenIdConnectProvider from '../providers/authentication/OpenIdConnectProvider'
import { siopGetRequest } from '../providers/authentication/SIOPv2Provider'
import { scanFingerPrint } from '../utils/BiometricUtils'

export const authenticate = async (identity: IBasicIdentity): Promise<void> => {
  return scanFingerPrint().then(() => {
    switch (identity.connection?.type) {
      case ConnectionTypeEnum.OPENID_CONNECT:
        new OpenIdConnectProvider().authenticate(identity.connection.config as IOpenIdConfig)
        break
      case ConnectionTypeEnum.SIOPv2_OpenID4VP:
        siopGetRequest(identity.connection.config as IDidAuthConfig)
        break
      default:
        return Promise.reject(Error(`No supported authentication provider for type: ${identity.connection?.type}`)) // TODO better check for connection
    }
  })
}
