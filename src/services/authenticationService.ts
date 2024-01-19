import Debug, {Debugger} from 'debug';
import {useSelector} from 'react-redux';

import {APP_ID} from '../@config/constants';
import {OnboardingMachine} from '../machines/onboardingMachine';
import RootNavigation from '../navigation/rootNavigation';
import store from '../store';
import {login as loginAction} from '../store/actions/user.actions';
import {QrTypesEnum, RootState, ScreenRoutesEnum, WalletAuthLockState} from '../types';
import {IUserState} from '../types/store/user.types';
import {IssuerConnection} from '../types/service/authenticationService';
import {convertURIToJsonObject} from '@sphereon/oid4vci-client/lib/functions';

const debug: Debugger = Debug(`${APP_ID}:authenticationService`);

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
  let lockState: WalletAuthLockState;
  if (userState.users.size === 0 || OnboardingMachine.hasInstance()) {
    lockState = WalletAuthLockState.ONBOARDING;
  } else if (userState.activeUser?.id && !!userState.loginTime) {
    lockState = WalletAuthLockState.AUTHENTICATED;
  } else {
    lockState = WalletAuthLockState.LOCKED;
  }
  debug(`Lock state: ${lockState}`);

  return lockState;
};

export function issuerConnectionFromURI(uri: string): IssuerConnection {
  debug(`Issuer Connection URI: ${uri}`);
  if (!uri.includes('?') || !uri.includes('://')) {
    debug(`Invalid Issuer Connection URI: ${uri}`);
    throw Error(`Invalid Issuer Connection Request`);
  }

  const jsonObject = convertURIToJsonObject(uri, {
    requiredProperties: ['issuer_url', 'client_id', 'redirect_uri'],
  }) as Record<string, string>;
  return {
    issuerUrl: jsonObject.issuer_url,
    clientId: jsonObject.client_id,
    redirectUri: jsonObject.redirect_uri,
    proxyTokenUrl: jsonObject.proxy_token_url,
  } as IssuerConnection;
}
