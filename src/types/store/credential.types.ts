import {ICredentialSummary} from '../credential';

export interface ICredentialState {
  loading: boolean;
  verifiableCredentials: Array<ICredentialSummary>;
}
