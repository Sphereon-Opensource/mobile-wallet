import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

export enum WalletCredentialStatus {
  VALID = 'VALID',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export type StatusListMechanism = 'oauth' | 'bitstring' | 'statuslist2021';

export interface StatusListInfo {
  type: StatusListMechanism;
  uri: string;
  index: number;
}

export interface CredentialStatusResult {
  status: WalletCredentialStatus;
  statusListInfo?: StatusListInfo;
  checkedAt: Date;
}

/**
 * Wallet-side augmentation of the UI-Components `CredentialSummary` (whose type lives in the
 * separate `@sphereon/ui-components.credential-branding` package). We never edit that type;
 * instead we carry the persisted store state alongside the summary in the wallet.
 */
export type WalletCredentialSummary = CredentialSummary & {verifiedState?: CredentialStateType};
