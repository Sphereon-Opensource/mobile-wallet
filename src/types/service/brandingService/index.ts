import {FindCredentialBrandingArgs, IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store-types';

export interface IAddCredentialBrandingArgs {
  issuerCorrelationId: string;
  vcHash: string;
  localeBranding: Array<IBasicCredentialLocaleBranding>;
}

export interface IRemoveCredentialBrandingArgs {
  filter: FindCredentialBrandingArgs;
}
