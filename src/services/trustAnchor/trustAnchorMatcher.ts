import Debug, {Debugger} from 'debug';
import {decodeJoseBlob} from '@sphereon/ssi-sdk.core';
import {APP_ID} from '../../@config/constants';
import {ITrustAnchor} from '../../types/store/trustAnchor.types';
import {parseCertificate} from './certificateParser';

const debug: Debugger = Debug(`${APP_ID}:trustAnchorMatcher`);

export type TrustAnchorMatch = {
  anchor: ITrustAnchor;
  matchedValue: string;
};

const normalizeDid = (did: string): string => did.trim().toLowerCase();

/**
 * Find which stored x5c trust anchors a verified certificate chain resolves to.
 *
 * Two signals are used (a verification that already succeeded is assumed):
 *  1. fingerprint — any certificate in the presented chain whose SHA-256 fingerprint equals a
 *     stored anchor (covers a CA cert carried in the chain, and a blindly-trusted self-signed leaf).
 *  2. issuer DN — the chain's top certificate was issued by a stored CA anchor not carried in the
 *     chain (top.issuerDN === anchor.subjectDN).
 *
 * @param x5cChain certificates as base64 DER (the x5c header values), leaf-first.
 * @param anchors  the stored trust anchors to match against.
 */
export const findTrustAnchorMatchesForX5c = async (x5cChain: Array<string>, anchors: Array<ITrustAnchor>): Promise<Array<TrustAnchorMatch>> => {
  const x5cAnchors = anchors.filter(a => a.type === 'x5c');
  if (x5cChain.length === 0 || x5cAnchors.length === 0) {
    return [];
  }

  const parsedChain: Array<{fingerprintSha256: string; subjectDN: string; issuerDN: string}> = [];
  for (const cert of x5cChain) {
    try {
      const info = await parseCertificate(cert);
      parsedChain.push({fingerprintSha256: info.fingerprintSha256, subjectDN: info.subjectDN, issuerDN: info.issuerDN});
    } catch (error) {
      debug(`skipping an unparseable certificate in the presented chain: ${error}`);
    }
  }
  if (parsedChain.length === 0) {
    return [];
  }

  const chainFingerprints = new Set(parsedChain.map(c => c.fingerprintSha256.toLowerCase()));
  const topIssuerDNs = new Set(parsedChain.map(c => c.issuerDN));

  const matches: Array<TrustAnchorMatch> = [];
  for (const anchor of x5cAnchors) {
    const fp = anchor.fingerprintSha256?.toLowerCase();
    const fingerprintMatch = fp !== undefined && chainFingerprints.has(fp);
    const issuerMatch = anchor.subjectDN !== undefined && topIssuerDNs.has(anchor.subjectDN);
    if (fingerprintMatch || issuerMatch) {
      matches.push({anchor, matchedValue: anchor.subjectDN ?? anchor.fingerprintSha256 ?? anchor.label});
    }
  }
  return matches;
};

/**
 * Find which stored did:web trust anchors a verified issuer/sender DID resolves to.
 * A match is an exact (case-insensitive) equality of the DID string.
 */
export const findTrustAnchorMatchesForDid = (did: string | undefined, anchors: Array<ITrustAnchor>): Array<TrustAnchorMatch> => {
  if (!did) {
    return [];
  }
  const target = normalizeDid(did);
  return anchors.filter(a => a.type === 'did:web' && normalizeDid(a.value) === target).map(anchor => ({anchor, matchedValue: did}));
};

/**
 * Extract the issuer x5c chain (base64 DER, leaf-first) from a raw issued credential, if present.
 * Handles compact JWS (JWT VC) and SD-JWT VC (`<jws>~<disclosure>~...`). Returns undefined for
 * formats without a JWS x5c header (JSON-LD, mdoc).
 */
export const extractIssuerX5cFromCredential = (raw: unknown): Array<string> | undefined => {
  if (typeof raw !== 'string') {
    return undefined;
  }
  const jws = raw.split('~')[0];
  const segments = jws.split('.');
  if (segments.length < 2) {
    return undefined;
  }
  try {
    const header = decodeJoseBlob(segments[0]) as {x5c?: Array<string>} | undefined;
    return Array.isArray(header?.x5c) && header!.x5c!.length > 0 ? header!.x5c : undefined;
  } catch (error) {
    debug(`could not extract x5c from credential JWS header: ${error}`);
    return undefined;
  }
};
