import {isStatusListError, isUntrustedIssuerError} from './oid4vciError';

describe('isUntrustedIssuerError', () => {
  it('detects a certificate chain validation failure carried in detailsMessage', () => {
    const error = {
      message: 'Invalid SD-JWT VC',
      detailsMessage: 'Certificate chain validation failed. Certificate chain validation failed for CN=IDK E2E TestCredential, O=Sphereon, C=NL.',
    };
    expect(isUntrustedIssuerError(error)).toBe(true);
  });

  it('detects a certificate chain validation failure carried in message', () => {
    const error = {message: 'Certificate chain validation failed for CN=IDK E2E TestCredential.'};
    expect(isUntrustedIssuerError(error)).toBe(true);
  });

  it('is case-insensitive', () => {
    const error = {detailsMessage: 'CERTIFICATE CHAIN VALIDATION FAILED.'};
    expect(isUntrustedIssuerError(error)).toBe(true);
  });

  it('returns false for an unrelated error', () => {
    const error = {message: 'Invalid SD-JWT VC', detailsMessage: 'SD-JWT VC could not be verified: bad signature'};
    expect(isUntrustedIssuerError(error)).toBe(false);
  });

  it('does NOT classify a status-list failure as an untrusted-issuer (credential cert) failure', () => {
    const error = {
      message: 'Invalid SD-JWT VC',
      detailsMessage: 'Status list token verification failed: Certificate chain validation failed for CN=IDK E2E TestCredential.',
    };
    expect(isUntrustedIssuerError(error)).toBe(false);
  });

  it('handles missing fields without throwing', () => {
    expect(isUntrustedIssuerError({})).toBe(false);
  });
});

describe('isStatusListError', () => {
  it('detects a status-list verification failure', () => {
    const error = {
      message: 'Invalid SD-JWT VC',
      detailsMessage: 'Status list token verification failed: Certificate chain validation failed for CN=IDK E2E TestCredential.',
    };
    expect(isStatusListError(error)).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isStatusListError({message: 'STATUS LIST could not be verified'})).toBe(true);
  });

  it('returns false for a plain credential cert failure', () => {
    expect(isStatusListError({detailsMessage: 'Certificate chain validation failed for CN=IDK E2E TestCredential.'})).toBe(false);
  });

  it('handles missing fields without throwing', () => {
    expect(isStatusListError({})).toBe(false);
  });
});
