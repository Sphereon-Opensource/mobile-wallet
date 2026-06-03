import {parseCertificate as parseX509Certificate} from '@sphereon/ssi-sdk-ext.x509-utils';
import {BasicConstraintsExtension} from '@peculiar/x509';
import {fromString} from 'uint8arrays';

export type ParsedCertificate = {
  pem: string;
  subjectDN: string;
  issuerDN: string;
  notBefore: Date;
  notAfter: Date;
  fingerprintSha256: string; // lowercase hex
  isCA: boolean;
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

const getCryptoSubtle = (): SubtleCrypto => {
  if (globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  // Fallback for Node environments without globalThis.crypto (Node < 19)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('crypto').webcrypto.subtle;
};

// The SSI-SDK x509 parser takes a PEM string or raw DER bytes. A bare base64 DER
// string (no PEM markers) is decoded to bytes here so all three input shapes work.
const normalizeInput = (input: string | Uint8Array): string | Uint8Array => {
  if (typeof input !== 'string') {
    return input;
  }
  if (input.includes('BEGIN CERTIFICATE')) {
    return input;
  }
  return fromString(input.replace(/\s+/g, ''), 'base64');
};

/**
 * Parse a certificate supplied as PEM, base64 DER, or raw DER bytes into stored metadata.
 * Parsing/decoding is delegated to the Sphereon SSI-SDK (@sphereon/ssi-sdk-ext.x509-utils),
 * the same React-Native-compatible x509 stack the wallet already uses for x5c validation.
 * Throws if the input is not a parseable X.509 certificate.
 */
export const parseCertificate = async (input: string | Uint8Array): Promise<ParsedCertificate> => {
  let parsed: Awaited<ReturnType<typeof parseX509Certificate>>;
  try {
    parsed = await parseX509Certificate(normalizeInput(input));
  } catch (error) {
    return Promise.reject(new Error(`Not a valid X.509 certificate: ${error}`));
  }

  const cert = parsed.x509Certificate;
  const {certificateInfo} = parsed;
  // x509-utils surfaces subject/issuer/validity but not BasicConstraints, so the CA flag
  // is read from the parsed certificate's extension here.
  const basicConstraints = cert.getExtension(BasicConstraintsExtension);
  const digest = await getCryptoSubtle().digest('SHA-256', cert.rawData);

  return {
    pem: cert.toString('pem'),
    subjectDN: certificateInfo.subject.dn.DN,
    issuerDN: certificateInfo.issuer.dn.DN,
    notBefore: certificateInfo.notBefore,
    notAfter: certificateInfo.notAfter,
    fingerprintSha256: toHex(digest),
    isCA: basicConstraints?.ca === true,
  };
};
