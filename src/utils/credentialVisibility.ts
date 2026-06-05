import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {CredentialStatus} from '@sphereon/ui-components.core';

// Reads the persisted verified state from either a CredentialSummary (`verifiedState` attached
// wallet-side) or a UniqueDigitalCredential (`digitalCredential.verifiedState`).
const verifiedStateOf = (c: any): CredentialStateType | undefined => c?.verifiedState ?? c?.digitalCredential?.verifiedState;

/**
 * A credential is considered revoked/expired either from the persisted store state
 * (`verifiedState`) or from the derived `credentialStatus` produced by the UI-Components branding
 * mapping. Works for both `CredentialSummary` and `UniqueDigitalCredential` shapes.
 */
export const isCredentialRevoked = (c: any): boolean =>
  verifiedStateOf(c) === CredentialStateType.REVOKED || c?.credentialStatus === CredentialStatus.REVOKED;

export const isCredentialExpired = (c: any): boolean =>
  verifiedStateOf(c) === CredentialStateType.EXPIRED || c?.credentialStatus === CredentialStatus.EXPIRED;

export const filterVisibleCredentials = <T>(credentials: Array<T>, opts: {showRevoked: boolean; showExpired: boolean}): Array<T> =>
  credentials.filter(c => {
    if (isCredentialRevoked(c) && !opts.showRevoked) return false;
    if (isCredentialExpired(c) && !opts.showExpired) return false;
    return true;
  });

/**
 * The status to display for a credential summary, preferring the persisted store state
 * (`verifiedState`) over the stubbed branding-derived `credentialStatus` (which never
 * reflects revocation). Used to colour the list/card status label correctly.
 */
export const toDisplayCredentialStatus = (c: any): CredentialStatus => {
  if (c?.verifiedState === CredentialStateType.REVOKED) return CredentialStatus.REVOKED;
  if (c?.verifiedState === CredentialStateType.EXPIRED) return CredentialStatus.EXPIRED;
  return c?.credentialStatus;
};
