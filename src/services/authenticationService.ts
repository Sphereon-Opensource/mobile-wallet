import Debug, {Debugger} from 'debug';
import {useSelector} from 'react-redux';

import {APP_ID} from '../@config/constants';
import {OnboardingMachine} from '../machines/onboardingMachine';
import RootNavigation from '../navigation/rootNavigation';
import store from '../store';
import {login as loginAction} from '../store/actions/user.actions';
import {RootState, ScreenRoutesEnum, WalletAuthLockState} from '../types';
import {IUserState} from '../types/store/user.types';
import {storageHasPin} from './storageService';

const debug: Debugger = Debug(`${APP_ID}:authenticationService`);

export const authenticate = async (onAuthenticate: () => Promise<void>): Promise<void> => {
  // TODO extend this function to look for the preference (biometrics or pin code). If no preference is present, use pin code
  await enterPinCode(onAuthenticate);
};

const enterPinCode = async (onAuthenticate: () => Promise<void>): Promise<void> => {
  RootNavigation.navigate(ScreenRoutesEnum.LOCK, {onAuthenticate, showProfileIcon: false});
};

export const login = async (): Promise<void> => {
  // TODO currently only supporting 1 user
  const userId: string = store.getState().user.users.values().next().value!.id;
  store.dispatch<any>(loginAction(userId));
};

export const walletAuthLockState = (navigationIsReady: boolean): WalletAuthLockState => {
  const {loading, activeUser, loginTime, users} = useSelector((state: RootState) => state.user);

  const isAuthenticated = !!activeUser?.id && !!loginTime;
  const shouldOnboard = users.size === 0 || OnboardingMachine.hasInstance() || !storageHasPin();

  let lockState: WalletAuthLockState;
  if (!loading && shouldOnboard) {
    lockState = WalletAuthLockState.ONBOARDING;
  } else if (isAuthenticated) {
    lockState = WalletAuthLockState.AUTHENTICATED;
  } else if (loading) {
    lockState = WalletAuthLockState.LOADING;
  } else {
    lockState = WalletAuthLockState.LOCKED;
  }
  debug(`AUTH Lock state: ${lockState}`);
  return lockState;
};
