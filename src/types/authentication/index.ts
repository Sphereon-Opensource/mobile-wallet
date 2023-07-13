import {JwtPayload} from 'jwt-decode';

export interface CustomJwtPayload extends JwtPayload {
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  realm_access: any; // TODO fix type
  scope: any; // TODO fix type
}

export interface IOpenIdAuthentication {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  user: IOpenIdAuthenticatedUser;
}

export interface IOpenIdAuthenticatedUser {
  id?: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Array<string>;
  scope: Array<string>;
}

export enum WalletAuthLockState {
  ONBOARDING = 'onboarding',
  AUTHENTICATED = 'authenticated',
  LOCKED = 'locked',
}
