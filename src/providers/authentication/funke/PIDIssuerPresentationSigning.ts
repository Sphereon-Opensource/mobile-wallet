import fetch from 'cross-fetch';

/**
 * This class is responsible for the presentation signing by the PID issuer for the C'' flow in the SPRIND Funke
 *
 * It hooks in as a signer into our SD-JWT plugin and Mdl-mdoc plugin
 */
export class PIDIssuerPresentationSigning {
  private HASH_BYTES_KEY = 'hash_bytes';
  private readonly signingUrl: string;
  private readonly _issuer: string;

  constructor(issuerUrl: string) {
    this._issuer = issuerUrl;
    this.signingUrl = `${issuerUrl}/presentation-signing`;
  }

  get issuer(): string {
    return this._issuer;
  }

  /**
   * Hash KB bytes that the PID issuer should sign in the C2 flow
   *
   * Our SD-JWt plugin can accept different signers, of which this is an example.
   * The plugin takes care of doing the hashing and applying the presentation frame.
   * Then it calls the sign callback (this method).
   * This particular instance delegates the signing to PID Issuer
   * @param base64UrlHash
   */
  async kbPresentationSigner(base64UrlHash: string): Promise<string> {
    const signingResponse = await fetch(`${this.signingUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({[this.HASH_BYTES_KEY]: base64UrlHash}),
    });

    if (signingResponse.ok) {
      const signatureBytes: string = (await signingResponse.json()).signature_bytes;
      if (!signatureBytes) {
        return Promise.reject(Error(`Expected a ${this.HASH_BYTES_KEY} json key-value in the response, but could not find it`));
      }
      return signatureBytes;
    }
    return Promise.reject(Error(`Signing via PID issuer failed: ${await signingResponse.text()}`));
  }
}
