import {FindCredentialBrandingArgs, IBasicCredentialLocaleBranding, IBasicIssuerLocaleBranding} from '@sphereon/ssi-sdk.data-store';

export interface IAddCredentialBrandingArgs {
  issuerCorrelationId: string;
  vcHash: string;
  localeBranding: Array<IBasicCredentialLocaleBranding>;
}

export interface IRemoveCredentialBrandingArgs {
  filter: FindCredentialBrandingArgs;
}

export interface ISelectAppLocaleBrandingArgs {
  localeBranding?: Array<IBasicCredentialLocaleBranding | IBasicIssuerLocaleBranding>;
}
