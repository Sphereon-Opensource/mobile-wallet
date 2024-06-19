import {ICredentialBranding} from '@sphereon/ssi-sdk.data-store';
import {IDeletionResult} from '@sphereon/ssi-sdk.issuance-branding';
import Debug, {Debugger} from 'debug';

import {APP_ID} from '../@config/constants';
import {ibAddCredentialBranding, ibRemoveCredentialBranding} from '../agent';
import {IAddCredentialBrandingArgs, IRemoveCredentialBrandingArgs} from '../types';

const debug: Debugger = Debug(`${APP_ID}:brandingService`);

export const addCredentialBranding = async (args: IAddCredentialBrandingArgs): Promise<ICredentialBranding> => {
  debug(`createCredentialBranding(${JSON.stringify(args)})...`);
  return ibAddCredentialBranding(args);
};

export const removeCredentialBranding = async (args: IRemoveCredentialBrandingArgs): Promise<IDeletionResult> => {
  debug(`removeCredentialBranding(${JSON.stringify(args)})...`);
  return ibRemoveCredentialBranding(args);
};
