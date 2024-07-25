import {OriginalVerifiableCredential} from '@sphereon/ssi-types';

import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

export enum CredentialIssuanceStateEnum {
  OFFER = 'offer',
}

export interface ICredentialTypeSelection {
  id: string;
  credentialType: string;
  credentialAlias: string;
  isSelected: boolean;
}

export interface ICredentialSelection {
  hash: string;
  id?: string;
  credential: CredentialSummary;
  rawCredential: OriginalVerifiableCredential;
  isSelected: boolean;
}
