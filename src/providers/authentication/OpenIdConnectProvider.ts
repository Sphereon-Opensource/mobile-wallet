import {OpenIdConfig} from '@sphereon/ssi-sdk.data-store';
import Debug, {Debugger} from 'debug';
import jwt_decode from 'jwt-decode';
import {
  AuthConfiguration,
  authorize,
  AuthorizeResult,
  refresh,
  RefreshResult,
  register,
  RegistrationConfiguration,
  RegistrationResponse,
  revoke,
  prefetchConfiguration as rnaa_prefetchConfiguration,
} from 'react-native-app-auth';

import {APP_ID} from '../../@config/constants';
import {CustomJwtPayload, IOpenIdAuthentication} from '../../types';

const debug: Debugger = Debug(`${APP_ID}:authentication`);

class OpenIdConnectProvider {
  public authenticate = async (config: OpenIdConfig): Promise<IOpenIdAuthentication> => {
    const authConfig = {
      ...config,
      additionalParameters: {
        prompt: 'login' as const,
      },
    };

    return authorize(authConfig)
      .then(async (authResult: AuthorizeResult) => {
        const decoded_token = this.decodeToken(authResult);
        const authenticatedUser = {
          id: decoded_token.sub,
          name: decoded_token.name,
          firstName: decoded_token.given_name,
          lastName: decoded_token.family_name,
          email: decoded_token.email,
          roles: decoded_token.realm_access?.roles,
          scope: decoded_token.scope,
        };

        return {
          accessToken: authResult.accessToken,
          refreshToken: authResult.refreshToken,
          idToken: authResult.idToken,
          user: authenticatedUser,
        };
      })
      .catch(error => {
        debug(`Authorization failed for clientId: ${config.clientId} with error: ${error}`);
        return Promise.reject(error);
      });
  };

  private decodeToken = (authResult: AuthorizeResult): CustomJwtPayload => {
    const options = {header: false};
    try {
      return jwt_decode<CustomJwtPayload>(authResult.accessToken, options);
    } catch (error: unknown) {
      return jwt_decode<CustomJwtPayload>(authResult.idToken, options);
    }
  };

  public prefetchConfiguration = async (config: AuthConfiguration): Promise<void> => {
    // TODO fully implement
    return rnaa_prefetchConfiguration(config);
  };

  public registerConfiguration = async (config: RegistrationConfiguration): Promise<RegistrationResponse> => {
    // TODO fully implement
    return register(config);
  };

  public refreshToken = async (config: AuthConfiguration, refreshToken: string): Promise<RefreshResult> => {
    // TODO fully implement
    return refresh(config, {
      refreshToken,
    });
  };

  public revokeToken = async (config: AuthConfiguration, token: string): Promise<void> => {
    // TODO fully implement
    return revoke(config, {
      tokenToRevoke: token,
    });
  };
}

export default OpenIdConnectProvider;
