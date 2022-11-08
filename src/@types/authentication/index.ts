import { SIOP } from '@sphereon/did-auth-siop'
import { JwtPayload } from 'jwt-decode'

export interface CustomJwtPayload extends JwtPayload {
  name: string
  given_name: string
  family_name: string
  email: string
  realm_access: any // TODO fix type
  scope: any // TODO fix type
}

export type CustomApproval =
  | string
  | ((verifiedAuthenticationRequest: SIOP.VerifiedAuthenticationRequestWithJWT) => Promise<void>)

export enum CustomApprovalEnum {
  PEX = 'pex',
  FINGERPRINT = 'fingerprint'
}
