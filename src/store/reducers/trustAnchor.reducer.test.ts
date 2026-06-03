import trustAnchorReducer from './trustAnchor.reducer';
import {
  CREATE_TRUST_ANCHOR_SUCCESS,
  DELETE_TRUST_ANCHOR_SUCCESS,
  GET_TRUST_ANCHORS_SUCCESS,
  TRUST_ANCHORS_LOADING,
} from '../../types/store/trustAnchor.action.types';
import {ITrustAnchor} from '../../types/store/trustAnchor.types';

const anchor = (id: string): ITrustAnchor => ({
  id,
  type: 'x5c',
  label: `anchor-${id}`,
  value: 'PEM',
  trustMode: 'ca',
  source: 'paste',
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
});
