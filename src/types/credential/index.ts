import {CredentialMetadata} from '@sphereon/openid4vci-client';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';

import {IImageSize} from '../../utils/ImageUtils';
import {LabelStatus} from '../component';

export enum CredentialStatusEnum {
  VALID = 'valid',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum IssuerStatusEnum {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

export enum CredentialIssuanceStateEnum {
  OFFER = 'offer',
}

// TODO create proper interface for credential summary / info
export interface ICredentialSummary {
  hash: string;
  id?: string; // The id of the credential (optional according to VCDM)
  title: string;
  issuer: IIssuerSummary;
  credentialStatus: CredentialStatusEnum;
  issueDate: number;
  expirationDate: number;
  properties: ICredentialDetailsRow[];
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
  imageSize?: IImageSize;
}

export interface ICredentialTypeSelection {
  id: string;
  credentialType: string;
  isSelected: boolean;
}

export interface ICredentialMetadata extends CredentialMetadata {
  credentialType: string;
}

export interface ICredentialSelection {
  hash: string;
  id?: string;
  credential: ICredentialSummary;
  rawCredential: OriginalVerifiableCredential;
  isSelected: boolean;
}
