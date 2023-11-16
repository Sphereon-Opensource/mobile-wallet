import {IUser} from '../user';

export interface IUserState {
  loading: boolean;
  users: Map<string, IUser>; // Will be used to determine if the onboarding flow needs to be started
  activeUser?: IUser; // Will be used to determine if the authentication flow needs to be started
  loginTime?: number;
}
