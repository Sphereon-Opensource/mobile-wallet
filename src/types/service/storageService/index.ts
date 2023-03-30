import {ACCESSIBLE} from 'react-native-secure-key-store';

import {IUser} from '../../user';

export interface IStorePinArgs {
  value: string;
  accessible?: ACCESSIBLE;
}

export interface IStoreUserArgs {
  user: IUser;
}
