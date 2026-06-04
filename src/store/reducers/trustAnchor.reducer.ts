import {
  CREATE_TRUST_ANCHOR_FAILED,
  CREATE_TRUST_ANCHOR_SUCCESS,
  DELETE_TRUST_ANCHOR_FAILED,
  DELETE_TRUST_ANCHOR_SUCCESS,
  GET_TRUST_ANCHOR_LINKS_FAILED,
  GET_TRUST_ANCHOR_LINKS_SUCCESS,
  GET_TRUST_ANCHORS_FAILED,
  GET_TRUST_ANCHORS_SUCCESS,
  RECORD_TRUST_ANCHOR_LINK_SUCCESS,
  TRUST_ANCHORS_LOADING,
  TrustAnchorActionTypes,
} from '../../types/store/trustAnchor.action.types';
import {ITrustAnchor, ITrustAnchorContactLink, ITrustAnchorState} from '../../types/store/trustAnchor.types';

const initialState: ITrustAnchorState = {
  loading: false,
  trustAnchors: [],
  links: [],
};

const trustAnchorReducer = (state: ITrustAnchorState = initialState, action: TrustAnchorActionTypes): ITrustAnchorState => {
  switch (action.type) {
    case TRUST_ANCHORS_LOADING:
      return {...state, loading: true};
    case GET_TRUST_ANCHORS_SUCCESS:
      return {...state, trustAnchors: action.payload, loading: false};
    case GET_TRUST_ANCHORS_FAILED:
      return {...state, loading: false};
    case CREATE_TRUST_ANCHOR_SUCCESS:
      return {...state, trustAnchors: [...state.trustAnchors, action.payload], loading: false};
    case CREATE_TRUST_ANCHOR_FAILED:
      return {...state, loading: false};
    case DELETE_TRUST_ANCHOR_SUCCESS:
      return {
        ...state,
        trustAnchors: state.trustAnchors.filter((a: ITrustAnchor): boolean => a.id !== action.payload),
        // Drop any links that referenced the removed anchor (storage already cascaded them).
        links: state.links.filter((l: ITrustAnchorContactLink): boolean => l.trustAnchorId !== action.payload),
        loading: false,
      };
    case DELETE_TRUST_ANCHOR_FAILED:
      return {...state, loading: false};
    case GET_TRUST_ANCHOR_LINKS_SUCCESS:
      return {...state, links: action.payload, loading: false};
    case GET_TRUST_ANCHOR_LINKS_FAILED:
      return {...state, loading: false};
    case RECORD_TRUST_ANCHOR_LINK_SUCCESS:
      return state.links.some((l: ITrustAnchorContactLink): boolean => l.id === action.payload.id)
        ? state
        : {...state, links: [action.payload, ...state.links]};
    default:
      return state;
  }
};

export default trustAnchorReducer;
