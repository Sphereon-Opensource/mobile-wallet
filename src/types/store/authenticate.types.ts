import { ConnectionTypeEnum } from '@sphereon/ssi-sdk-data-store'
import { VerifiedAuthorizationRequest } from '@sphereon/did-auth-siop'

export interface IAuthenticatedEntity {
  entityId: string
  connectionType: ConnectionTypeEnum
  authentication: IAuthentication
}

export type IAuthentication = IOpenIdAuthentication | VerifiedAuthorizationRequest

export interface IOpenIdAuthentication {
  accessToken: string
  refreshToken: string
  idToken: string
  user: IOpenIdAuthenticatedUser
}

export interface IOpenIdAuthenticatedUser {
  id?: string
  name: string
  firstName: string
  lastName: string
  email: string
  roles: Array<string>
  scope: Array<string>
}

export interface IAuthenticationState {
  loading: boolean
  entities: Array<IAuthenticatedEntity>
}

export interface IDisconnectConnectionPayload {
  entityId: string
}
