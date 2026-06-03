import {getBlindlyTrustedAnchors, getX5cTrustAnchors, __setUserAnchorsForTest} from './trustAnchorRegistry';
import {sphereonCA} from '../@config/trustanchors';

describe('trustAnchorRegistry', () => {
  afterEach(() => __setUserAnchorsForTest({ca: [], blind: []}));

  it('always includes the built-in CA defaults', () => {
    expect(getX5cTrustAnchors()).toContain(sphereonCA);
  });

  it('merges user CA anchors with built-ins', () => {
    __setUserAnchorsForTest({ca: ['USER_CA_PEM'], blind: []});
    const anchors = getX5cTrustAnchors();
    expect(anchors).toContain(sphereonCA);
    expect(anchors).toContain('USER_CA_PEM');
  });

  it('routes blind-trust anchors to the blind list, not the CA list', () => {
    __setUserAnchorsForTest({ca: [], blind: ['USER_SELF_SIGNED_LEAF']});
    expect(getBlindlyTrustedAnchors()).toContain('USER_SELF_SIGNED_LEAF');
    expect(getX5cTrustAnchors()).not.toContain('USER_SELF_SIGNED_LEAF');
  });
});
