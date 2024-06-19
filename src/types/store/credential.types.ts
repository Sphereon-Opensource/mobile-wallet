import {CredentialSummary} from '@sphereon/ui-components.credential-mapper';

export interface ICredentialState {
  loading: boolean;
  verifiableCredentials: Array<CredentialSummary>;
}
