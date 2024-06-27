import {CredentialSummary} from '@sphereon/ui-components.credential-representation';

export interface ICredentialState {
  loading: boolean;
  verifiableCredentials: Array<CredentialSummary>;
}
