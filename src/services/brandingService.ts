import {IBasicCredentialLocaleBranding, IBasicIssuerLocaleBranding, ICredentialBranding, IIssuerBranding} from '@sphereon/ssi-sdk.data-store';
import {IDeletionResult, IGetIssuerBrandingArgs} from '@sphereon/ssi-sdk.issuance-branding';
import Debug, {Debugger} from 'debug';

import {APP_ID} from '../@config/constants';
import {ibAddCredentialBranding, ibGetCredentialBranding, ibGetIssuerBranding, ibRemoveCredentialBranding} from '../agent';
import Localization from '../localization/Localization';
import {IAddCredentialBrandingArgs, IRemoveCredentialBrandingArgs, ISelectAppLocaleBrandingArgs} from '../types';
import {preloadImage} from '../utils/ImageUtils';

const debug: Debugger = Debug(`${APP_ID}:brandingService`);

export const addCredentialBranding = async (args: IAddCredentialBrandingArgs): Promise<ICredentialBranding> => {
  debug(`createCredentialBranding(${JSON.stringify(args)})...`);
  return ibAddCredentialBranding(args);
};

export const removeCredentialBranding = async (args: IRemoveCredentialBrandingArgs): Promise<IDeletionResult> => {
  debug(`removeCredentialBranding(${JSON.stringify(args)})...`);
  return ibRemoveCredentialBranding(args);
};

export const selectAppLocaleBranding = async (
  args: ISelectAppLocaleBrandingArgs,
): Promise<IBasicCredentialLocaleBranding | IBasicIssuerLocaleBranding | undefined> => {
  // We need to retrieve the locale of the app and select a matching branding or fallback on a branding without a locale
  // We search for a first match that starts with the app locale
  const appLocale: string = Localization.getLocale();
  const localeBranding: IBasicCredentialLocaleBranding | IBasicIssuerLocaleBranding | undefined = args.localeBranding?.find(
    (branding: IBasicCredentialLocaleBranding | IBasicIssuerLocaleBranding) =>
      branding.locale?.startsWith(appLocale) || branding.locale === undefined,
  );

  const logo: string | undefined = localeBranding?.logo?.dataUri || localeBranding?.logo?.uri;
  if (logo) {
    preloadImage([{uri: logo}]).catch((): void => {
      //ignore
    });
  }

  const backgroundImage: string | undefined = localeBranding?.background?.image?.dataUri || localeBranding?.background?.image?.uri;
  if (backgroundImage) {
    preloadImage([{uri: backgroundImage}]).catch((): void => {
      //ignore
    });
  }

  return localeBranding;
};

export const getIssuerBrandingFromStorage = async (args: IGetIssuerBrandingArgs): Promise<IIssuerBranding[]> => {
  debug(`getBrandingFromStorage(${JSON.stringify(args)})...`);
  try {
    const branding = await ibGetIssuerBranding(args);
    debug(`getBrandingFromStorage(${JSON.stringify(args)}), result: ${JSON.stringify(branding)}`);
    return branding;
  } catch (e) {
    debug(`Error on getting the branding! ${e}`);
    throw e;
  }
};
