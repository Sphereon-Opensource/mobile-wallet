import fetch from 'cross-fetch';
import {IDPOPState} from '../../../types/store/dpop.types';
import store from '../../../store';
import * as u8a from 'uint8arrays';
import {hash} from '@stablelib/sha256';
/**
 * This class is responsible for the presentation signing by the PID issuer for the C'' flow in the SPRIND Funke
 *
 * It hooks in as a signer into our SD-JWT plugin and Mdl-mdoc plugin
 */
export class PIDIssuerPresentationSigning {
  private HASH_BYTES_KEY = 'hash_bytes';
  private SIGNATURE_BYTES_KEY = 'signature_bytes';
  private readonly signingUrl: string;
  private readonly _issuer: string;

  constructor(issuerUrl: string) {
    // binding this for any potential context loss
    this.kbPresentationSigner = this.kbPresentationSigner.bind(this);

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
   * @param kbJWT
   */
  async kbPresentationSigner(kbJWT: string): Promise<string> {
    const data = u8a.fromString(kbJWT);
    const hashBytes = u8a.toString(hash(data), 'base64url');
    const dpopState: IDPOPState = store.getState().dpop;

    if (!dpopState.dpop) {
      return Promise.reject(Error(`Signing via PID issuer failed. No DPOP present`));
    }

    if (!dpopState.accessToken) {
      return Promise.reject(Error(`Signing via PID issuer failed. No access token present`));
    }

    const headers = {
      dpop: dpopState.dpop,
      Authorization: `DPoP ${dpopState.accessToken}`,
      'Content-Type': 'application/json',
    };

    const signingResponse = await fetch(this.signingUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({[this.HASH_BYTES_KEY]: hashBytes}),
    });

    if (signingResponse.ok) {
      const signatureBytes: string = (await signingResponse.json())[this.SIGNATURE_BYTES_KEY];
      if (!signatureBytes) {
        return Promise.reject(Error(`Expected a ${this.SIGNATURE_BYTES_KEY} json key-value in the response, but could not find it`));
      }

      return signatureBytes;
    }

    return Promise.reject(Error(`Signing via PID issuer failed: ${await signingResponse.text()}`));
  }
}
