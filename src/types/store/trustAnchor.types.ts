import {TrustAnchorMode, TrustAnchorSource, TrustAnchorType} from '../../entities/TrustAnchorEntity';

export interface ITrustAnchor {
  id: string;
  type: TrustAnchorType;
  label: string;
  value: string;
  trustMode: TrustAnchorMode;
  subjectDN?: string;
  issuerDN?: string;
  notBefore?: string; // ISO string in the store (serializable)
  notAfter?: string;
  fingerprintSha256?: string;
  source: TrustAnchorSource;
  createdAt: string;
}

export interface ITrustAnchorState {
  loading: boolean;
  trustAnchors: Array<ITrustAnchor>;
}

export interface IAddTrustAnchorArgs {
  label: string;
  type: TrustAnchorType;
  value: string; // PEM/base64/DER text or did:web string
  source: TrustAnchorSource;
  trustMode?: TrustAnchorMode; // overrides the auto-detected mode when provided
}
