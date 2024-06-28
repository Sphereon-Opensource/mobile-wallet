import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

export interface ICredentialState {
  loading: boolean;
  verifiableCredentials: Array<CredentialSummary>;
}
