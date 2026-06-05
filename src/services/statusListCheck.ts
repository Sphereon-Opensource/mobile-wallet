import {simpleCheckStatusFromStatusListUrl} from '@sphereon/ssi-sdk.vc-status-list';
import {StatusListInfo} from '../types/credentialStatus';

/**
 * Fetches the status list at `info.uri` and returns the numeric status at `info.index`.
 * Returns 0 (valid), 1 (invalid/revoked), 2 (suspended). Throws on fetch/parse failure
 * so the caller can map it to a "keep last state" outcome.
 */
export const checkStatusListIndex = async (info: StatusListInfo): Promise<number> => {
  const result = await simpleCheckStatusFromStatusListUrl({
    statusListCredential: info.uri,
    statusListIndex: String(info.index),
  });
  return typeof result === 'number' ? result : Number(result);
};
