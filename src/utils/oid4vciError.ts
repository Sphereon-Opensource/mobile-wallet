/**
 * Helpers for turning low-level OID4VCI issuance verification errors into clear, user-facing messages.
 *
 * The Sphereon SDK surfaces a generic top-level message (e.g. "Invalid SD-JWT VC") while the real cause
 * (e.g. an untrusted issuer certificate chain, or an untrusted/invalid status-list token) is carried in
 * the error details. We classify those so the UI can show an actionable message instead of the generic one.
 */

export type Oid4vciErrorLike = {
  message?: string;
  detailsMessage?: string;
};

const haystackOf = (error: Oid4vciErrorLike): string => `${error.message ?? ''} ${error.detailsMessage ?? ''}`.toLowerCase();

/**
 * Detects whether a failure was caused by verifying the credential's STATUS LIST token (its signer's
 * certificate chain could not be validated, or the status-list verification otherwise failed). The SDK
 * tags status-list failures with "status list" so we can distinguish them from the credential's own
 * signature failing. Checked first because a status-list failure also contains the cert-chain phrase.
 */
export const isStatusListError = (error: Oid4vciErrorLike): boolean => haystackOf(error).includes('status list');

/**
 * Detects whether a failure was caused by an untrusted issuer certificate chain on the credential itself
 * (i.e. the issuer's certificate could not be validated against any trusted anchor). The SD-JWT verifier
 * always prefixes this failure with "Certificate chain validation failed".
 */
export const isUntrustedIssuerError = (error: Oid4vciErrorLike): boolean =>
  !isStatusListError(error) && haystackOf(error).includes('certificate chain validation failed');
