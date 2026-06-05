import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {StatusListInfo, WalletCredentialStatus} from '../types/credentialStatus';

/**
 * Extracts the status-list reference from a uniform credential document.
 * Supports IETF/OAuth Token Status List (SD-JWT VC `status.status_list = {idx, uri}`)
 * and W3C `credentialStatus` (BitstringStatusListEntry / StatusList2021Entry).
 */
export const extractStatusListInfo = (uniformDocument: any): StatusListInfo | undefined => {
  if (!uniformDocument || typeof uniformDocument !== 'object') {
    return undefined;
  }

  // IETF / OAuth Token Status List (SD-JWT VC): status.status_list = { idx, uri }
  const sl = uniformDocument.status?.status_list;
  if (sl && typeof sl.uri === 'string' && sl.idx !== undefined) {
    return {type: 'oauth', uri: sl.uri, index: Number(sl.idx)};
  }

  // W3C credentialStatus (single object or array)
  const cs = uniformDocument.credentialStatus;
  const entry = Array.isArray(cs) ? cs[0] : cs;
  if (entry && typeof entry === 'object' && entry.statusListCredential && entry.statusListIndex !== undefined) {
    const type = entry.type === 'BitstringStatusListEntry' ? 'bitstring' : 'statuslist2021';
    return {type, uri: entry.statusListCredential, index: Number(entry.statusListIndex)};
  }

  return undefined;
};

const STATUS_ROOT_LABELS = ['status', 'status_list', 'credentialStatus'];

/**
 * True when a row is the ROOT of a status-list claim subtree (e.g. `status` / `credentialStatus`).
 * Note: `toCredentialSummary` assigns random UUID ids and flattens nested objects into a
 * depth-ordered array, so we match on the human-readable `label`, not the id.
 */
export const isStatusListProperty = (row: CredentialDetailsRow): boolean => STATUS_ROOT_LABELS.includes((row.label ?? '').toString());

/**
 * Removes status-list claim rows from a flattened, depth-ordered `CredentialDetailsRow[]`.
 * When a status-list root row is found, it AND all of its deeper-depth descendants are dropped
 * (so nested `status_list.idx` / `.uri` leaves don't end up orphaned in the claims list).
 */
export const filterOutStatusListRows = (rows: Array<CredentialDetailsRow>): Array<CredentialDetailsRow> => {
  const result: Array<CredentialDetailsRow> = [];
  let skipDepth: number | null = null;
  for (const row of rows) {
    const depth = row.depth ?? 0;
    if (skipDepth !== null && depth > skipDepth) {
      continue; // descendant of a status-list subtree we're dropping
    }
    skipDepth = null;
    if (isStatusListProperty(row)) {
      skipDepth = depth; // drop this root row and everything nested beneath it
      continue;
    }
    result.push(row);
  }
  return result;
};

/**
 * Best-known wallet status from the persisted store state alone (no live check), used to seed the
 * detail screen so a known-revoked/suspended/expired credential doesn't briefly flash VALID before
 * the background re-check resolves. Only trusts the persisted `verifiedState` — computed expiry is
 * left to the live check to avoid mis-seeding from ambiguous date units.
 */
export const initialWalletStatus = (verifiedState?: CredentialStateType): WalletCredentialStatus => {
  switch (verifiedState) {
    case CredentialStateType.REVOKED:
      return WalletCredentialStatus.REVOKED;
    case CredentialStateType.SUSPENDED:
      return WalletCredentialStatus.SUSPENDED;
    case CredentialStateType.EXPIRED:
      return WalletCredentialStatus.EXPIRED;
    case CredentialStateType.UNTRUSTED:
      return WalletCredentialStatus.UNTRUSTED;
    default:
      return WalletCredentialStatus.VALID;
  }
};

const persistedToWallet = (s?: CredentialStateType): WalletCredentialStatus => {
  switch (s) {
    case CredentialStateType.REVOKED:
      return WalletCredentialStatus.REVOKED;
    case CredentialStateType.SUSPENDED:
      return WalletCredentialStatus.SUSPENDED;
    case CredentialStateType.EXPIRED:
      return WalletCredentialStatus.EXPIRED;
    case CredentialStateType.UNTRUSTED:
      return WalletCredentialStatus.UNTRUSTED;
    default:
      return WalletCredentialStatus.VALID;
  }
};

const expiryOverlay = (base: WalletCredentialStatus, expirationDate?: Date): WalletCredentialStatus => {
  if (base === WalletCredentialStatus.VALID && expirationDate && expirationDate.getTime() < Date.now()) {
    return WalletCredentialStatus.EXPIRED;
  }
  return base;
};

/**
 * Maps a status-list check result + expiry + persisted state to the wallet status.
 * checkResult: 0 Valid, 1 Invalid/Revoked, 2 Suspended; undefined = no status list;
 * 'ERROR' = fetch/parse failed (keep last persisted state, no downgrade);
 * 'UNTRUSTED' = the status list could not be cryptographically verified (bad signature / untrusted x5c).
 *   Signature validation is security-critical, so this surfaces a distinct INVALID state and NO signal
 *   from the list is honored — except a permanent persisted REVOKED, which is never overridden.
 */
export const mapToWalletStatus = (args: {
  checkResult: number | 'ERROR' | 'UNTRUSTED' | undefined;
  expirationDate?: Date;
  persistedState?: CredentialStateType;
}): WalletCredentialStatus => {
  const {checkResult, expirationDate, persistedState} = args;
  if (persistedState === CredentialStateType.REVOKED) {
    return WalletCredentialStatus.REVOKED;
  }
  if (checkResult === 'UNTRUSTED') {
    return WalletCredentialStatus.UNTRUSTED;
  }
  if (checkResult === 'ERROR') {
    return expiryOverlay(persistedToWallet(persistedState), expirationDate);
  }
  if (checkResult === 1) {
    return WalletCredentialStatus.REVOKED;
  }
  if (checkResult === 2) {
    return WalletCredentialStatus.SUSPENDED;
  }
  // checkResult === 0 (valid) or undefined (no status list) → valid, then expiry overlay
  return expiryOverlay(WalletCredentialStatus.VALID, expirationDate);
};
