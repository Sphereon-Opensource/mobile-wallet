import {ICredentialBranding, IGetIssuerBrandingArgs, IIssuerBranding} from '@sphereon/ssi-sdk.data-store';
import {IDeletionResult} from '@sphereon/ssi-sdk.issuance-branding';
import Debug, {Debugger} from 'debug';

import {APP_ID} from '../@config/constants';
import agent from '../agent';
import {IAddCredentialBrandingArgs, IRemoveCredentialBrandingArgs} from '../types';

const debug: Debugger = Debug(`${APP_ID}:brandingService`);

export const addCredentialBranding = async (args: IAddCredentialBrandingArgs): Promise<ICredentialBranding> => {
  debug(`createCredentialBranding(${JSON.stringify(args)})...`);
  return agent.ibAddCredentialBranding(args);
};

export const removeCredentialBranding = async (args: IRemoveCredentialBrandingArgs): Promise<IDeletionResult> => {
  debug(`removeCredentialBranding(${JSON.stringify(args)})...`);
  return agent.ibRemoveCredentialBranding(args);
};

export const getIssuerBrandingFromStorage = async (args: IGetIssuerBrandingArgs): Promise<IIssuerBranding[]> => {
  debug(`getBrandingFromStorage(${JSON.stringify(args)})...`);
  try {
    const branding = await agent.ibGetIssuerBranding(args);
    debug(`getBrandingFromStorage(${JSON.stringify(args)}), result: ${JSON.stringify(branding)}`);
    return branding;
  } catch (e) {
    debug(`Error on getting the branding! ${e}`);
    throw e;
  }
};
