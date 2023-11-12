import Debug from 'debug';
import {useSelector} from 'react-redux';

import {APP_ID} from '../@config/constants';
import {OnboardingMachine} from '../machines/onboardingMachine';
import RootNavigation from '../navigation/rootNavigation';
import store from '../store';
import {login as loginAction} from '../store/actions/user.actions';
import {RootState, ScreenRoutesEnum, WalletAuthLockState} from '../types';
import {IUserState} from '../types/store/user.types';

const debug: Debug.Debugger = Debug(`${APP_ID}:authenticationService`);

export const authenticate = async (onAuthenticate: () => Promise<void>): Promise<void> => {
  // TODO extend this function to look for the preference (biometrics or pin code). If no preference is present, use pin code
  await enterPinCode(onAuthenticate);
};

const enterPinCode = async (onAuthenticate: () => Promise<void>): Promise<void> => {
  RootNavigation.navigate(ScreenRoutesEnum.LOCK, {onAuthenticate});
};

export const login = async (): Promise<void> => {
  // TODO currently only supporting 1 user
  const userId: string = store.getState().user.users.values().next().value.id;
  store.dispatch<any>(loginAction(userId));
};

export const walletAuthLockState = (): WalletAuthLockState => {
  const userState: IUserState = useSelector((state: RootState) => state.user);
  console.log(`User state: ${JSON.stringify(userState)}`);
  let lockState: WalletAuthLockState;
  if (userState.users.size === 0 || OnboardingMachine.hasInstance()) {
    lockState = WalletAuthLockState.ONBOARDING;
  } else if (!userState.activeUser) {
    lockState = WalletAuthLockState.LOCKED;
  } else {
    lockState = WalletAuthLockState.AUTHENTICATED;
  }
  console.log(`Lock state: ${lockState}`);

  return lockState;
};
