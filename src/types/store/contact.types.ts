import {Party} from '@sphereon/ssi-sdk.data-store-types';

export interface IContactState {
  loading: boolean;
  contacts: Array<Party>;
}
