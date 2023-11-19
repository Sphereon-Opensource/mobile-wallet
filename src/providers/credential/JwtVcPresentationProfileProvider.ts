import fetch from 'cross-fetch';
import Debug, {Debugger} from 'debug';
import jwt_decode from 'jwt-decode';
import {URL} from 'react-native-url-polyfill';

import {APP_ID} from '../../@config/constants';
import {translate} from '../../localization/Localization';
import {QrTypesEnum} from '../../types';

const debug: Debugger = Debug(`${APP_ID}:jwt`);

class JwtVcPresentationProfileProvider {
  public getUrl = async (uri: string): Promise<string> => {
    if (!uri.startsWith(QrTypesEnum.OPENID_VC)) {
      debug(`Invalid Uri. Uri: ${uri}`);
      return Promise.reject(Error('Invalid Uri'));
    }

    const requestUri = new URL(uri).searchParams.get('request_uri');
    if (!requestUri) {
      debug(`No request uri found`);
      return Promise.reject(Error('No request uri found'));
    }

    return requestUri;
  };

  public getRequest = async (url: string): Promise<any> => {
    // TODO typings when process is clear
    return fetch(url)
      .then((response: Response) => {
        if (response.status >= 400) {
          if (response.status === 404) {
            return Promise.reject(Error(translate('qr_scanner_qr_no_longer_valid_message')));
          }
          debug(`Bad response from server. Code: ${response.status}`);
          return Promise.reject(Error(`Bad response from server. Code: ${response.status}`));
        }
        return response.text();
      })
      .then((jwt: string) => {
        return this.decodeToken(jwt);
      })
      .catch((error: Error) => {
        debug(`Unable to contact server. Error: ${error}`);
        return Promise.reject(error);
      });
  };

  public getManifest = async (request: any): Promise<any> => {
    // TODO typings when process is clear
    // TODO we need to think about how we can handle getting the credential name
    // TODO add request type checks when process is clear
    return fetch(request.claims.vp_token.presentation_definition.input_descriptors[0].issuance[0].manifest)
      .then(async (response: Response) => {
        if (response.status >= 400) {
          debug(`Bad response from server`);
          return Promise.reject(Error('Bad response from server'));
        }
        return response.json();
      })
      .then((response: any) => {
        // TODO typings when process is clear
        return this.decodeToken(response.token);
      })
      .catch(error => {
        debug(`Unable to contact server. Error: ${error}`);
        return Promise.reject(error);
      });
  };

  private decodeToken = (jwt: string): any => {
    // TODO jwt typings when process is clear
    const options = {header: false};
    try {
      return jwt_decode<any>(jwt, options);
    } catch (error: unknown) {
      debug(`Error parsing JWT. ${error}`);
      return Promise.reject(error);
    }
  };
}

export default JwtVcPresentationProfileProvider;
