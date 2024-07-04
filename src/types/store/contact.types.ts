import {Party} from '@sphereon/ssi-sdk.data-store';

export interface IContactState {
  loading: boolean;
  contacts: Array<Party>;
}
