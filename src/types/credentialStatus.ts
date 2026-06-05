import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

export enum WalletCredentialStatus {
  VALID = 'VALID',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  // The status list could not be cryptographically verified (bad signature, or an x5c chain that does
  // not validate against the wallet's trust anchors). The status is therefore UNTRUSTED: no signal from
  // the list (valid/revoked/suspended) is honored. Distinct from a transient fetch/parse failure.
  UNTRUSTED = 'UNTRUSTED',
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
