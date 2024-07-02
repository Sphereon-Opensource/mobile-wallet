import {Party as StoreParty} from '@sphereon/ssi-sdk.data-store';
import {ILocaleBranding} from '@sphereon/ssi-sdk.data-store';

export interface IContactState {
  loading: boolean;
  contacts: Array<Party>;
}

export type Party = StoreParty & {branding?: ILocaleBranding};
