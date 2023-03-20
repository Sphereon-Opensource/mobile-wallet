import { VerifiedAuthorizationRequest } from '@sphereon/did-auth-siop'
import { JwtPayload } from 'jwt-decode'

export interface CustomJwtPayload extends JwtPayload {
  name: string
  given_name: string
  family_name: string
  email: string
  realm_access: any // TODO fix type
  scope: any // TODO fix type
}

export type CustomApproval = string | ((verifiedAuthorizationRequest: VerifiedAuthorizationRequest) => Promise<void>)

export enum CustomApprovalEnum {
  PEX = 'pex',
  FINGERPRINT = 'fingerprint'
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
