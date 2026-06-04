import {ITrustAnchor} from '../../types/store/trustAnchor.types';
import {parseCertificate} from './certificateParser';
import {extractIssuerX5cFromCredential, findTrustAnchorMatchesForDid, findTrustAnchorMatchesForX5c} from './trustAnchorMatcher';

const IDK_E2E_CA_PEM = `-----BEGIN CERTIFICATE-----
MIIBtTCCAVygAwIBAgIUYHPHPaIhLbZjEG+87CQGaZRT1r0wCgYIKoZIzj0EAwIw
JzElMCMGA1UEAwwcSURLIEUyRSBDQSwgTz1TcGhlcmVvbiwgQz1OTDAeFw0yNjA0
MjkxNjI0NDRaFw0zNjA0MjYxNjI0NDRaMCcxJTAjBgNVBAMMHElESyBFMkUgQ0Es
IE89U3BoZXJlb24sIEM9TkwwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQ/QuTk
dimVLElzTHWWRizMyXFP5cxzM+yh4cev69MUXxgdbKxKOrj+MiyibEY2KofqAN3K
hD9MtijUxE80AZeho2YwZDAdBgNVHQ4EFgQU4yGaoD/fqNjRbtD+oLYLU25xeq4w
HwYDVR0jBBgwFoAU4yGaoD/fqNjRbtD+oLYLU25xeq4wEgYDVR0TAQH/BAgwBgEB
/wIBADAOBgNVHQ8BAf8EBAMCAQYwCgYIKoZIzj0EAwIDRwAwRAIgRnEcATheGu7k
S9202u8Pw72876+HollpN2soD/kvd9ACICUz0HMgd7/K1/reEK0D4wxQdLvG2pBM
QbJEgC/RKNkP
-----END CERTIFICATE-----`;

const CA_BASE64_DER = IDK_E2E_CA_PEM.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');

const anchor = (overrides: Partial<ITrustAnchor>): ITrustAnchor => ({
  id: 'anchor-1',
  type: 'x5c',
  label: 'IDK E2E CA',
  value: IDK_E2E_CA_PEM,
  trustMode: 'ca',
  source: 'paste',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('trustAnchorMatcher', () => {
  describe('findTrustAnchorMatchesForDid', () => {
    const didAnchor = anchor({id: 'did-1', type: 'did:web', value: 'did:web:issuer.example.com', subjectDN: undefined, fingerprintSha256: undefined});

    it('matches a did:web anchor by exact (case-insensitive) did', () => {
      const matches = findTrustAnchorMatchesForDid('did:web:Issuer.Example.com', [didAnchor]);
      expect(matches).toHaveLength(1);
      expect(matches[0].anchor.id).toBe('did-1');
      expect(matches[0].matchedValue).toBe('did:web:Issuer.Example.com');
    });

    it('returns nothing for a non-matching did or no did', () => {
      expect(findTrustAnchorMatchesForDid('did:web:other.example.com', [didAnchor])).toHaveLength(0);
      expect(findTrustAnchorMatchesForDid(undefined, [didAnchor])).toHaveLength(0);
    });

    it('ignores x5c anchors', () => {
      expect(findTrustAnchorMatchesForDid('did:web:issuer.example.com', [anchor({})])).toHaveLength(0);
    });
  });

  describe('findTrustAnchorMatchesForX5c', () => {
    let caFingerprint: string;
    let caSubjectDN: string;
    beforeAll(async () => {
      const info = await parseCertificate(IDK_E2E_CA_PEM);
      caFingerprint = info.fingerprintSha256;
      caSubjectDN = info.subjectDN;
    });

    it('matches when a stored anchor fingerprint is present in the chain', async () => {
      const stored = anchor({id: 'fp', fingerprintSha256: caFingerprint, subjectDN: caSubjectDN});
      const matches = await findTrustAnchorMatchesForX5c([CA_BASE64_DER], [stored]);
      expect(matches).toHaveLength(1);
      expect(matches[0].anchor.id).toBe('fp');
      expect(matches[0].matchedValue).toBe(caSubjectDN);
    });

    it("matches when the chain top's issuer equals a stored CA anchor subject", async () => {
      // self-signed CA: the cert's issuerDN == the anchor subjectDN, with no fingerprint on the anchor.
      const stored = anchor({id: 'iss', fingerprintSha256: undefined, subjectDN: caSubjectDN});
      const matches = await findTrustAnchorMatchesForX5c([CA_BASE64_DER], [stored]);
      expect(matches).toHaveLength(1);
      expect(matches[0].anchor.id).toBe('iss');
    });

    it('returns nothing when no stored anchor matches', async () => {
      const stored = anchor({id: 'nope', fingerprintSha256: 'deadbeef', subjectDN: 'CN=Someone Else'});
      expect(await findTrustAnchorMatchesForX5c([CA_BASE64_DER], [stored])).toHaveLength(0);
    });

    it('returns nothing for an empty chain or no x5c anchors', async () => {
      const stored = anchor({fingerprintSha256: caFingerprint});
      expect(await findTrustAnchorMatchesForX5c([], [stored])).toHaveLength(0);
      expect(await findTrustAnchorMatchesForX5c([CA_BASE64_DER], [])).toHaveLength(0);
    });
  });

  describe('extractIssuerX5cFromCredential', () => {
    const b64url = (obj: object): string => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const jws = (header: object): string => `${b64url(header)}.${b64url({iss: 'issuer'})}.signature`;

    it('extracts x5c from a compact JWS (JWT VC) header', () => {
      const x5c = ['MIIBcert', 'MIIBca'];
      expect(extractIssuerX5cFromCredential(jws({alg: 'ES256', x5c}))).toEqual(x5c);
    });

    it('extracts x5c from an SD-JWT VC (jws~disclosures)', () => {
      const x5c = ['MIIBcert'];
      const sdJwt = `${jws({alg: 'ES256', x5c})}~WyJzYWx0Il0~WyJzYWx0MiJd~`;
      expect(extractIssuerX5cFromCredential(sdJwt)).toEqual(x5c);
    });

    it('returns undefined when there is no x5c header', () => {
      expect(extractIssuerX5cFromCredential(jws({alg: 'ES256'}))).toBeUndefined();
    });

    it('returns undefined for non-JWS / non-string input', () => {
      expect(extractIssuerX5cFromCredential('not-a-jws')).toBeUndefined();
      expect(extractIssuerX5cFromCredential({issuer: 'did:web:x'})).toBeUndefined();
      expect(extractIssuerX5cFromCredential(undefined)).toBeUndefined();
    });
  });
});
