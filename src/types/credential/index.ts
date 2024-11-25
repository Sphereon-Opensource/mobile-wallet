import {OriginalVerifiableCredential} from '@sphereon/ssi-types';

import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {DigitalCredential} from '@sphereon/ssi-sdk.data-store';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';

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
  uniqueDigitalCredential: UniqueDigitalCredential;
  isSelected: boolean;
}
