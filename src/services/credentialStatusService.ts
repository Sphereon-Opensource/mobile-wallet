import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {ActionType, InitiatorType, LogLevel, SubSystem, System} from '@sphereon/ssi-types';
import agent from '../agent';
import {translate} from '../localization/Localization';
import {ToastTypeEnum} from '../types';
import {CredentialStatusResult, StatusListInfo, WalletCredentialStatus} from '../types/credentialStatus';
import {extractStatusListInfo, mapToWalletStatus} from '../utils/credentialStatus';
import {showToast} from '../utils/ToastUtils';
import {checkStatusListVerified} from './statusListCheck';
import store from '../store';
import {storeActivityLogging} from '../store/actions/logging.actions';

export const ACTIVITY_VC_STATUS_CHANGED = 'VC status changed';

// Skip re-checking a credential in the background sweep if it was checked within this window.
export const STATUS_CHECK_MIN_INTERVAL_MS = 5 * 60 * 1000;

// States that warrant a user notification + activity entry when newly entered.
const NOTIFY_STATES = new Set<WalletCredentialStatus>([
  WalletCredentialStatus.REVOKED,
  WalletCredentialStatus.EXPIRED,
  WalletCredentialStatus.SUSPENDED,
  WalletCredentialStatus.UNTRUSTED,
]);

const toCredentialStateType = (s: WalletCredentialStatus): CredentialStateType | undefined => {
  switch (s) {
    case WalletCredentialStatus.REVOKED:
      return CredentialStateType.REVOKED;
    case WalletCredentialStatus.SUSPENDED:
      return CredentialStateType.SUSPENDED;
    case WalletCredentialStatus.EXPIRED:
      return CredentialStateType.EXPIRED;
    case WalletCredentialStatus.VALID:
      return CredentialStateType.VERIFIED;
    case WalletCredentialStatus.UNTRUSTED:
      return CredentialStateType.UNTRUSTED;
    default:
      return undefined;
  }
};

const stateTypeToWallet = (s?: CredentialStateType): WalletCredentialStatus | undefined => {
  switch (s) {
    case CredentialStateType.REVOKED:
      return WalletCredentialStatus.REVOKED;
    case CredentialStateType.EXPIRED:
      return WalletCredentialStatus.EXPIRED;
    case CredentialStateType.SUSPENDED:
      return WalletCredentialStatus.SUSPENDED;
    case CredentialStateType.UNTRUSTED:
      return WalletCredentialStatus.UNTRUSTED;
    default:
      return undefined;
  }
};

/**
 * Logs a "VC status changed" activity via the redux thunk (the same path the issuance/share
 * events use), so it both persists and is appended to the in-memory activity feed immediately.
 */
type StatusActivityMeta = {fromStatus?: WalletCredentialStatus; statusListInfo?: StatusListInfo};

const logStatusChangeActivity = async (hash: string, status: WalletCredentialStatus, meta?: StatusActivityMeta): Promise<void> => {
  try {
    await store.dispatch<any>(
      storeActivityLogging({
        level: LogLevel.INFO,
        system: System.CREDENTIALS,
        subSystemType: SubSystem.VC_PERSISTENCE,
        initiatorType: InitiatorType.SYSTEM,
        description: 'Credential status changed',
        actionType: ActionType.UPDATE,
        actionSubType: ACTIVITY_VC_STATUS_CHANGED,
        credentialHash: hash,
        data: {credentialHash: hash, status, fromStatus: meta?.fromStatus, statusListInfo: meta?.statusListInfo},
      } as any),
    );
  } catch {
    // best-effort activity logging
  }
};

/**
 * Idempotently ensures a "status changed" activity exists for this credential+status. Logs one if
 * missing (handles credentials whose transition happened in a prior session/version). No toast.
 */
const ensureStatusActivity = async (hash: string, status: WalletCredentialStatus, meta?: StatusActivityMeta): Promise<void> => {
  try {
    const existing = await agent.loggerGetActivityEvents();
    const has = existing.some(
      (e: any) =>
        e.actionSubType === ACTIVITY_VC_STATUS_CHANGED && ((e as any).credentialHash ?? e.data?.credentialHash) === hash && e.data?.status === status,
    );
    if (!has) {
      await logStatusChangeActivity(hash, status, meta);
    }
  } catch {
    // best-effort
  }
};

const parseUniform = (raw?: string): any => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const getExpirationDate = (uniform: any, dc: any): Date | undefined => {
  if (uniform?.expirationDate) return new Date(uniform.expirationDate);
  if (uniform?.validUntil) return new Date(uniform.validUntil);
  if (dc?.validUntil) return new Date(dc.validUntil);
  return undefined;
};

/**
 * Re-evaluates a single credential's status: checks the status list (if any), applies the
 * expiry overlay, persists the resulting state (REVOKED is permanent), and on a NEW transition
 * into a notify-state shows a toast + logs an Activity entry. Failures keep the last state.
 */
export const evaluateCredentialStatus = async (unique: UniqueDigitalCredential): Promise<CredentialStatusResult> => {
  const dc: any = unique.digitalCredential;
  const hash: string = dc.hash;
  const now = new Date();

  const uniform = parseUniform(dc.uniformDocument);
  const statusListInfo = extractStatusListInfo(uniform);

  // Permanent revocation short-circuit — never re-check, never re-notify.
  // Still surface statusListInfo so the detail view can show the list URL/index, and make sure an
  // activity entry exists for the revocation (it may have been logged in a prior session/version).
  if (dc.verifiedState === CredentialStateType.REVOKED) {
    await ensureStatusActivity(hash, WalletCredentialStatus.REVOKED, {statusListInfo});
    return {status: WalletCredentialStatus.REVOKED, statusListInfo, checkedAt: now};
  }

  const expirationDate = getExpirationDate(uniform, dc);

  // Verify the status-list token (signature + x5c trust) before honoring any signal. An unverifiable list
  // maps to 'UNTRUSTED' (untrusted) rather than a trusted status; transient failures map to 'ERROR'.
  let checkResult: number | 'ERROR' | 'UNTRUSTED' | undefined = undefined;
  if (statusListInfo) {
    try {
      const outcome = await checkStatusListVerified(statusListInfo);
      if (outcome.kind === 'status') {
        checkResult = outcome.value;
      } else if (outcome.kind === 'untrusted') {
        console.warn(`Status list could not be verified for ${hash}: ${outcome.reason}`);
        checkResult = 'UNTRUSTED';
      } else {
        checkResult = 'ERROR';
      }
    } catch {
      checkResult = 'ERROR';
    }
  }

  const status = mapToWalletStatus({checkResult, expirationDate, persistedState: dc.verifiedState});
  const previous: CredentialStateType | undefined = dc.verifiedState;
  const next = toCredentialStateType(status);
  const transitioned = !!next && next !== previous;

  // Persist new state + always update last-checked timestamp (best-effort).
  try {
    if (transitioned) {
      await agent.crsUpdateCredentialState({
        hash,
        verifiedState: next!,
        ...(next === CredentialStateType.REVOKED ? {revokedAt: now} : {verifiedAt: now}),
      } as any);
    }
    await agent.crsUpdateCredential({hash, statusLastCheckedAt: now} as any);
  } catch {
    // best-effort persistence; do not fail the evaluation
  }

  // Notify + Activity on a genuine transition into a notify-state.
  const previousWallet = stateTypeToWallet(previous);
  if (transitioned && NOTIFY_STATES.has(status)) {
    const key = status.toLowerCase();
    showToast(ToastTypeEnum.TOAST_ERROR, {
      title: translate(`credential_status_toast_${key}_title`),
      message: translate(`credential_status_toast_${key}_message`),
    });
    await ensureStatusActivity(hash, status, {fromStatus: previousWallet ?? WalletCredentialStatus.VALID, statusListInfo});
  } else if (transitioned && status === WalletCredentialStatus.VALID && previousWallet && NOTIFY_STATES.has(previousWallet)) {
    // Recovery: a previously problematic credential (e.g. untrusted after a trust anchor was added) is
    // valid again. Log the symmetric activity (e.g. untrusted → valid) + a positive notification.
    showToast(ToastTypeEnum.TOAST_SUCCESS, {
      title: translate('credential_status_toast_valid_title'),
      message: translate('credential_status_toast_valid_message'),
    });
    await ensureStatusActivity(hash, WalletCredentialStatus.VALID, {fromStatus: previousWallet, statusListInfo});
  }

  return {status, statusListInfo, checkedAt: now};
};

/**
 * One-time backfill: ensures every already-persisted revoked/suspended/expired credential has a
 * "status changed" activity entry (in case the transition happened before activity logging worked
 * or in a prior version). Idempotent — skips credentials that already have a matching entry. No toast.
 */
export const backfillStatusActivities = async (credentials: Array<UniqueDigitalCredential>): Promise<void> => {
  const flagged = credentials
    .map(u => ({
      hash: u.digitalCredential.hash as string,
      status: stateTypeToWallet(u.digitalCredential.verifiedState),
      statusListInfo: extractStatusListInfo(parseUniform(u.digitalCredential.uniformDocument)),
    }))
    .filter((c): c is {hash: string; status: WalletCredentialStatus; statusListInfo: StatusListInfo | undefined} => !!c.status);
  if (flagged.length === 0) return;

  let existing: Array<any> = [];
  try {
    existing = await agent.loggerGetActivityEvents();
  } catch {
    return;
  }
  const existingKeys = new Set(
    existing
      .filter(e => e.actionSubType === ACTIVITY_VC_STATUS_CHANGED)
      .map(e => `${(e as any).credentialHash ?? e.data?.credentialHash}|${e.data?.status}`),
  );

  for (const {hash, status, statusListInfo} of flagged) {
    const key = `${hash}|${status}`;
    if (existingKeys.has(key)) continue;
    await logStatusChangeActivity(hash, status, {statusListInfo});
    existingKeys.add(key);
  }
};

/**
 * Background sweep over holder credentials that carry a status mechanism and are not already
 * permanently revoked. Throttled by `status_last_checked_at`. Per-credential failures are isolated.
 */
export const evaluateAllCredentialStatuses = async (credentials: Array<UniqueDigitalCredential>): Promise<void> => {
  // Backfill activity entries for any already-flagged credentials (revoked/suspended/expired)
  // that don't have one yet, so the activity feed reflects them even if logged in a prior version.
  await backfillStatusActivities(credentials);

  for (const unique of credentials) {
    const dc: any = unique.digitalCredential;
    if (dc.verifiedState === CredentialStateType.REVOKED) continue;
    const last = dc.statusLastCheckedAt ? new Date(dc.statusLastCheckedAt).getTime() : 0;
    if (Date.now() - last < STATUS_CHECK_MIN_INTERVAL_MS) continue;
    if (!extractStatusListInfo(parseUniform(dc.uniformDocument))) continue;
    try {
      await evaluateCredentialStatus(unique);
    } catch {
      // isolate per-credential failures so one bad credential doesn't abort the sweep
    }
  }
};
