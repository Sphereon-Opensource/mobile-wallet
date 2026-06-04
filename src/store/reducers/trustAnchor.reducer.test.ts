import trustAnchorReducer from './trustAnchor.reducer';
import {
  CREATE_TRUST_ANCHOR_SUCCESS,
  DELETE_TRUST_ANCHOR_SUCCESS,
  GET_TRUST_ANCHOR_LINKS_SUCCESS,
  GET_TRUST_ANCHORS_SUCCESS,
  RECORD_TRUST_ANCHOR_LINK_SUCCESS,
  TRUST_ANCHORS_LOADING,
} from '../../types/store/trustAnchor.action.types';
import {ITrustAnchor, ITrustAnchorContactLink} from '../../types/store/trustAnchor.types';

const anchor = (id: string): ITrustAnchor => ({
  id,
  type: 'x5c',
  label: `anchor-${id}`,
  value: 'PEM',
  trustMode: 'ca',
  source: 'paste',
  createdAt: '2026-06-02T00:00:00.000Z',
});

const link = (id: string, trustAnchorId: string, contactId: string): ITrustAnchorContactLink => ({
  id,
  trustAnchorId,
  contactId,
  matchedType: 'x5c',
  createdAt: '2026-06-02T00:00:00.000Z',
});

describe('trustAnchorReducer', () => {
  it('sets loading', () => {
    const state = trustAnchorReducer(undefined, {type: TRUST_ANCHORS_LOADING});
    expect(state.loading).toBe(true);
  });

  it('stores fetched anchors', () => {
    const state = trustAnchorReducer(undefined, {type: GET_TRUST_ANCHORS_SUCCESS, payload: [anchor('1')]});
    expect(state.trustAnchors).toHaveLength(1);
    expect(state.loading).toBe(false);
  });

  it('appends a created anchor', () => {
    const start = trustAnchorReducer(undefined, {type: GET_TRUST_ANCHORS_SUCCESS, payload: [anchor('1')]});
    const state = trustAnchorReducer(start, {type: CREATE_TRUST_ANCHOR_SUCCESS, payload: anchor('2')});
    expect(state.trustAnchors.map(a => a.id)).toEqual(['1', '2']);
  });

  it('removes a deleted anchor', () => {
    const start = trustAnchorReducer(undefined, {type: GET_TRUST_ANCHORS_SUCCESS, payload: [anchor('1'), anchor('2')]});
    const state = trustAnchorReducer(start, {type: DELETE_TRUST_ANCHOR_SUCCESS, payload: '1'});
    expect(state.trustAnchors.map(a => a.id)).toEqual(['2']);
  });

  it('stores fetched links', () => {
    const state = trustAnchorReducer(undefined, {type: GET_TRUST_ANCHOR_LINKS_SUCCESS, payload: [link('l1', 'a1', 'c1')]});
    expect(state.links.map(l => l.id)).toEqual(['l1']);
  });

  it('prepends a recorded link and ignores duplicates', () => {
    const start = trustAnchorReducer(undefined, {type: GET_TRUST_ANCHOR_LINKS_SUCCESS, payload: [link('l1', 'a1', 'c1')]});
    const added = trustAnchorReducer(start, {type: RECORD_TRUST_ANCHOR_LINK_SUCCESS, payload: link('l2', 'a1', 'c2')});
    expect(added.links.map(l => l.id)).toEqual(['l2', 'l1']);
    const dup = trustAnchorReducer(added, {type: RECORD_TRUST_ANCHOR_LINK_SUCCESS, payload: link('l2', 'a1', 'c2')});
    expect(dup.links.map(l => l.id)).toEqual(['l2', 'l1']);
  });

  it('drops links for a deleted anchor', () => {
    const withAnchors = trustAnchorReducer(undefined, {type: GET_TRUST_ANCHORS_SUCCESS, payload: [anchor('a1'), anchor('a2')]});
    const withLinks = trustAnchorReducer(withAnchors, {
      type: GET_TRUST_ANCHOR_LINKS_SUCCESS,
      payload: [link('l1', 'a1', 'c1'), link('l2', 'a2', 'c1')],
    });
    const state = trustAnchorReducer(withLinks, {type: DELETE_TRUST_ANCHOR_SUCCESS, payload: 'a1'});
    expect(state.links.map(l => l.id)).toEqual(['l2']);
  });
});
