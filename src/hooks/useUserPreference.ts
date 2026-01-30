import {useSelector} from 'react-redux';
import {RootState} from '../types';
import {IUserPreferences} from '../types/preferences';

export const useUserPreference = <K extends keyof IUserPreferences>(key: K): IUserPreferences[K] | undefined => {
  return useSelector((state: RootState) => state.user.activeUser?.preferences?.[key]);
};
