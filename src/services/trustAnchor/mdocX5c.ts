import Debug, {Debugger} from 'debug';
import {decodeMdocIssuerSigned} from '@sphereon/ssi-types';
import {APP_ID} from '../../@config/constants';

const debug: Debugger = Debug(`${APP_ID}:trustAnchorMatcher`);

/**
 * Extract the issuer x5chain (base64 DER, leaf-first) from a raw mso_mdoc credential
 * (a base64url-encoded IssuerSigned CBOR), by reading the issuerAuth COSE_Sign1 header.
 *
 * Lives in its own module so the pure {@link ./trustAnchorMatcher} (and its unit tests) need not
 * pull in the heavy KMP mdoc/cbor stack. Returns undefined for non-mdoc input (JWT/SD-JWT contain
 * '.'/'~', which base64url CBOR never does) or when no x5chain is present.
 */
export const extractIssuerX5cFromMdoc = (raw: unknown): Array<string> | undefined => {
  if (typeof raw !== 'string' || raw.length === 0 || raw.includes('.') || raw.includes('~')) {
    return undefined;
  }
  try {
    // decodeMdocIssuerSigned(base64url IssuerSigned) -> MdocDocument; toJson().toJsonDTO() -> plain JSON.
    const json: any = (decodeMdocIssuerSigned(raw as any) as any).toJson().toJsonDTO();
    const issuerAuth = json?.issuerSigned?.issuerAuth;
    const x5chain: unknown = issuerAuth?.unprotectedHeader?.x5chain ?? issuerAuth?.protectedHeader?.x5chain;
    return Array.isArray(x5chain) && x5chain.length > 0 ? (x5chain as Array<string>) : undefined;
  } catch (error) {
    debug(`could not extract x5chain from mdoc issuerAuth: ${error}`);
    return undefined;
  }
};
