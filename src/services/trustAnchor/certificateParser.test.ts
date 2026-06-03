import {parseCertificate} from './certificateParser';

// Real IDK E2E CA (CN=IDK E2E CA, O=Sphereon, C=NL) — the concrete trust anchor this feature must support.
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

describe('parseCertificate', () => {
  it('parses a self-signed CA PEM into metadata', async () => {
    const info = await parseCertificate(IDK_E2E_CA_PEM);
    expect(info.subjectDN).toContain('IDK E2E CA');
    expect(info.issuerDN).toContain('IDK E2E CA'); // self-signed
    expect(info.isCA).toBe(true);
    expect(info.notAfter.getFullYear()).toBe(2036);
    expect(info.fingerprintSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(info.pem).toContain('BEGIN CERTIFICATE');
  });

  it('normalizes base64 DER (no PEM markers) to PEM', async () => {
    const base64Der = IDK_E2E_CA_PEM.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    const info = await parseCertificate(base64Der);
    expect(info.subjectDN).toContain('IDK E2E CA');
    expect(info.pem).toContain('BEGIN CERTIFICATE');
  });

  it('rejects non-certificate input', async () => {
    await expect(parseCertificate('not a certificate')).rejects.toThrow();
  });

  it('produces a stable fingerprint across PEM and DER inputs', async () => {
    const base64Der = IDK_E2E_CA_PEM.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
    const a = await parseCertificate(IDK_E2E_CA_PEM);
    const b = await parseCertificate(base64Der);
    expect(a.fingerprintSha256).toBe(b.fingerprintSha256);
  });
});
