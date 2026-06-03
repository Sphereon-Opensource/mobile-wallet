import {
  CREATE_TRUST_ANCHOR_FAILED,
  CREATE_TRUST_ANCHOR_SUCCESS,
  DELETE_TRUST_ANCHOR_FAILED,
  DELETE_TRUST_ANCHOR_SUCCESS,
  GET_TRUST_ANCHORS_FAILED,
  GET_TRUST_ANCHORS_SUCCESS,
  TRUST_ANCHORS_LOADING,
  TrustAnchorActionTypes,
} from '../../types/store/trustAnchor.action.types';
import {ITrustAnchor, ITrustAnchorState} from '../../types/store/trustAnchor.types';

const initialState: ITrustAnchorState = {
  loading: false,
  trustAnchors: [],
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
      return {...state, trustAnchors: state.trustAnchors.filter((a: ITrustAnchor): boolean => a.id !== action.payload), loading: false};
    case DELETE_TRUST_ANCHOR_FAILED:
      return {...state, loading: false};
    default:
      return state;
  }
};

export default trustAnchorReducer;
