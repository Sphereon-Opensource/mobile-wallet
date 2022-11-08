export enum CredentialStatusEnum {
  VALID = 'valid',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

export enum CredentialIssuanceStateEnum {
  OFFER = 'offer',
  ACCEPTED = 'accepted'
}

// TODO create proper interface for credential summary / info
export interface ICredentialSummary {
  id: string
  title: string
  issuer: IIssuerSummary | string
  credentialStatus: CredentialStatusEnum
  issueDate: number
  expirationDate: number
  properties: ICredentialDetailsRow[]
  signedBy: string
}

// TODO create proper interface for credential summary / info
export interface IIssuerSummary {
  name: string
  image?: string
  url?: string
}

// TODO interface should be replaced by proper interface for credential details
export interface ICredentialDetailsRow {
  id: string
  label: string
  value: any
}
