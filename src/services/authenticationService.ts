import {ConnectionTypeEnum, IBasicConnection, IDidAuthConfig, IOpenIdConfig} from '@sphereon/ssi-sdk-data-store';

import OpenIdConnectProvider from '../providers/authentication/OpenIdConnectProvider';
import {siopGetRequest} from '../providers/authentication/SIOPv2Provider';
import RootNavigation from "../navigation/rootNavigation";
import {ScreenRoutesEnum} from "../types";

export const authenticate = async (connection: IBasicConnection): Promise<void> => {

  return navigateToPinCodeForVerification().then(() => {
    switch (connection?.type) {
      case ConnectionTypeEnum.OPENID_CONNECT:
        new OpenIdConnectProvider().authenticate(connection.config as IOpenIdConfig);
        break;
      case ConnectionTypeEnum.SIOPv2_OpenID4VP:
        siopGetRequest(connection.config as IDidAuthConfig);
        break;
      default:
        return Promise.reject(Error(`No supported authentication provider for type: ${connection?.type}`));
    }
  })
}

const navigateToPinCodeForVerification = (): Promise<void> => {
  return new Promise((resolve): void => {
    const onVerificationSuccess = async (): Promise<void> => {
      resolve();
    }
    RootNavigation.navigate(ScreenRoutesEnum.LOCK, {
      onVerificationSuccess
    })
  })
}
