import {IBasicCredentialLocaleBranding, IBasicIssuerLocaleBranding, ICredentialBranding} from '@sphereon/ssi-sdk.data-store';
import {IDeletionResult} from '@sphereon/ssi-sdk.issuance-branding';
import Debug from 'debug';

import {APP_ID} from '../@config/constants';
import {ibAddCredentialBranding, ibRemoveCredentialBranding} from '../agent';
import Localization from '../localization/Localization';
import {IAddCredentialBrandingArgs, IRemoveCredentialBrandingArgs} from '../types';

const debug: Debug.Debugger = Debug(`${APP_ID}:brandingService`);

export const createCredentialBranding = async (args: IAddCredentialBrandingArgs): Promise<ICredentialBranding> => {
  debug(`createCredentialBranding(${JSON.stringify(args)})...`);
  return ibAddCredentialBranding(args);
};

export const removeCredentialBranding = async (args: IRemoveCredentialBrandingArgs): Promise<IDeletionResult> => {
  debug(`removeCredentialBranding(${JSON.stringify(args)})...`);
  return ibRemoveCredentialBranding(args);
};

export const selectAppLocaleBranding = async (args: {
  localeBranding?: Array<IBasicCredentialLocaleBranding | IBasicIssuerLocaleBranding>;
}): Promise<IBasicCredentialLocaleBranding | IBasicIssuerLocaleBranding | undefined> => {
  // We need to retrieve the locale of the app and select a matching branding or fallback on a branding without a locale
  // We search for a first match that starts with the app locale
  const appLocale: string = Localization.getLocale();
  return args.localeBranding?.find(
    (branding: IBasicCredentialLocaleBranding | IBasicIssuerLocaleBranding) =>
      branding.locale?.startsWith(appLocale) || branding.locale === undefined,
  );
};
