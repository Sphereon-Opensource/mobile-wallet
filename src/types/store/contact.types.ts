import {Party} from '@sphereon/ssi-sdk.data-store';
import {ILocaleBranding} from '@sphereon/ssi-sdk.data-store';

export interface IContactState {
  loading: boolean;
  contacts: Array<PartyWithBranding>;
}

export type PartyWithBranding = Party & {branding?: ILocaleBranding};
