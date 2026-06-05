import {checkStatusIndexFromStatusListCredential, simpleCheckStatusFromStatusListUrl} from '@sphereon/ssi-sdk.vc-status-list';
import agent from '../agent';
import {getBlindlyTrustedAnchors, getX5cTrustAnchors} from '../agent/trustAnchorRegistry';
import {StatusListInfo} from '../types/credentialStatus';

/**
 * Outcome of a verified status-list check.
 * - `status`: the list was cryptographically verified; `value` is 0 (valid), 1 (revoked), 2 (suspended).
 * - `invalid`: the status-list token's signature could not be verified, or its x5c chain does not validate
 *   against the wallet's trust anchors. The list is UNTRUSTED — its status signal must NOT be honored.
 * - `error`: a transient failure (fetch/parse). Caller should keep the last known state.
 */
export type StatusCheckOutcome = {kind: 'status'; value: number} | {kind: 'untrusted'; reason: string} | {kind: 'error'; reason: string};

const base64UrlDecode = (input: string): string => {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  // eslint-disable-next-line no-undef
  const g: any = globalThis as any;
  if (typeof g.atob === 'function') {
    return g.atob(b64);
  }
  // RN provides Buffer via rn-nodeify; fall back to it.
  return g.Buffer.from(b64, 'base64').toString('binary');
};

const decodeJwtHeader = (jws: string): Record<string, any> => {
  const [headerB64] = jws.split('.');
  return JSON.parse(decodeURIComponent(escape(base64UrlDecode(headerB64))));
};

/**
 * Fetches the raw status-list token (a compact `statuslist+jwt` JWS) from the status endpoint.
 */
const fetchStatusListToken = async (uri: string): Promise<string> => {
  const response = await fetch(uri, {headers: {Accept: 'application/statuslist+jwt'}});
  if (!response.ok) {
    throw new Error(`Status list fetch failed: ${response.status} ${response.statusText}`);
  }
  return (await response.text()).trim();
};

/**
 * Verifies the status-list token's authenticity:
 *  - signature must be valid (always);
 *  - if it carries an x5c chain, that chain must validate against the wallet's trust anchors;
 *  - DID-signed tokens are verified by signature only — we intentionally do NOT (yet) anchor-check DIDs.
 * Returns a human-readable reason on failure.
 */
const verifyStatusListToken = async (jws: string): Promise<{ok: true} | {ok: false; reason: string}> => {
  let header: Record<string, any>;
  try {
    header = decodeJwtHeader(jws);
  } catch (e) {
    return {ok: false, reason: `Status list token header could not be decoded: ${e instanceof Error ? e.message : String(e)}`};
  }

  // 1. Signature (resolves the key from the token header: x5c leaf, jwk, or did).
  const sig = await agent.jwtVerifyJwsSignature({jws});
  if (sig.error) {
    return {ok: false, reason: `Status list token signature invalid: ${sig.message ?? 'unknown error'}`};
  }

  // 2. x5c chain → must validate against trust anchors. (DIDs are deliberately not anchor-checked here.)
  const x5c = header?.x5c;
  if (Array.isArray(x5c) && x5c.length > 0) {
    const chainResult = await agent.x509VerifyCertificateChain({
      chain: x5c,
      trustAnchors: getX5cTrustAnchors(),
      opts: {blindlyTrustedAnchors: getBlindlyTrustedAnchors()},
    });
    if (chainResult.error || !chainResult.certificateChain) {
      return {ok: false, reason: `Status list token certificate chain not trusted: ${chainResult.message ?? 'unknown error'}`};
    }
  }

  return {ok: true};
};

/**
 * Fetches, VERIFIES, and reads a status-list entry. Unlike a plain bit-read, this validates the
 * status-list token's signature/trust first; an unverifiable list yields `invalid` (untrusted), not a
 * trusted status. Transient failures yield `error` (keep last state).
 */
export const checkStatusListVerified = async (info: StatusListInfo): Promise<StatusCheckOutcome> => {
  // Only the IETF/OAuth Token Status List is a compact JWS we authenticate here. W3C status lists
  // (bitstring / statuslist2021) use a different JSON-LD credential format — fall back to a non-verifying
  // read so we don't falsely report them as 'untrusted'. (W3C status-list verification is future work.)
  if (info.type !== 'oauth') {
    try {
      return {kind: 'status', value: await checkStatusListIndex(info)};
    } catch (e) {
      return {kind: 'error', reason: e instanceof Error ? e.message : String(e)};
    }
  }

  let jws: string;
  try {
    jws = await fetchStatusListToken(info.uri);
  } catch (e) {
    return {kind: 'error', reason: e instanceof Error ? e.message : String(e)};
  }

  const verification = await verifyStatusListToken(jws);
  if (!verification.ok) {
    return {kind: 'untrusted', reason: verification.reason};
  }

  try {
    // Read the index off the already-fetched, verified token (avoids a second fetch).
    const result = await checkStatusIndexFromStatusListCredential({statusListCredential: jws, statusListIndex: String(info.index)});
    const value = typeof result === 'number' ? result : Number(result);
    return {kind: 'status', value};
  } catch (e) {
    return {kind: 'error', reason: e instanceof Error ? e.message : String(e)};
  }
};

/**
 * Legacy non-verifying bit read. Retained for callers that only need the raw status value.
 * Prefer {@link checkStatusListVerified} for anything user-facing — it validates trust.
 */
export const checkStatusListIndex = async (info: StatusListInfo): Promise<number> => {
  const result = await simpleCheckStatusFromStatusListUrl({
    statusListCredential: info.uri,
    statusListIndex: String(info.index),
  });
  return typeof result === 'number' ? result : Number(result);
};
