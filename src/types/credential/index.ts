import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {CredentialStatus, ImageSize} from '@sphereon/ui-components.core';

import {LabelStatus} from '../component';

export enum CredentialIssuanceStateEnum {
  OFFER = 'offer',
}

// TODO create proper interface for credential summary / info
export interface ICredentialSummary {
  hash: string;
  id?: string; // The id of the credential (optional according to VCDM)
  title: string;
  issuer: IIssuerSummary;
  credentialStatus: CredentialStatus;
  issueDate: number;
  expirationDate: number;
  properties: ICredentialDetailsRow[];
  branding?: IBasicCredentialLocaleBranding;
}

// TODO create proper interface for credential summary / info
export interface IIssuerSummary {
  name: string;
  alias: string;
  image?: string;
  url?: string;
}

// TODO interface should be replaced by proper interface for credential details
export interface ICredentialDetailsRow {
  id: string;
  label: string;
  value: any;
  isEditable?: boolean;
  status?: LabelStatus;
  imageSize?: ImageSize;
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
  credential: ICredentialSummary;
  rawCredential: OriginalVerifiableCredential;
  isSelected: boolean;
}
