import {Action} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {translate} from '../../localization/Localization';
import {refreshFromStorage as refreshTrustAnchorRegistry} from '../../agent/trustAnchorRegistry';
import {
  addTrustAnchor as storeTrustAnchor,
  getTrustAnchorLinks as getTrustAnchorLinksFromStorage,
  getTrustAnchors as getTrustAnchorsFromStorage,
  recordTrustAnchorLink as storeRecordTrustAnchorLink,
  removeTrustAnchor as deleteTrustAnchorFromStorage,
} from '../../services/trustAnchor/trustAnchorService';
import {findTrustAnchorMatchesForDid, findTrustAnchorMatchesForX5c, TrustAnchorMatch} from '../../services/trustAnchor/trustAnchorMatcher';
import {RootState, ToastTypeEnum} from '../../types';
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
} from '../../types/store/trustAnchor.action.types';
import {IAddTrustAnchorArgs, ITrustAnchor, ITrustAnchorContactLink} from '../../types/store/trustAnchor.types';
import {showToast} from '../../utils';

export const getTrustAnchors = (): ThunkAction<Promise<Array<ITrustAnchor>>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<Array<ITrustAnchor>> => {
    dispatch({type: TRUST_ANCHORS_LOADING});
    try {
      const anchors = await getTrustAnchorsFromStorage();
      dispatch({type: GET_TRUST_ANCHORS_SUCCESS, payload: anchors});
      return anchors;
    } catch (error) {
      dispatch({type: GET_TRUST_ANCHORS_FAILED});
      return Promise.reject(error);
    }
  };
};

export const addTrustAnchor = (args: IAddTrustAnchorArgs): ThunkAction<Promise<ITrustAnchor>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<ITrustAnchor> => {
    dispatch({type: TRUST_ANCHORS_LOADING});
    try {
      const anchor = await storeTrustAnchor(args);
      await refreshTrustAnchorRegistry(); // make the new anchor live for verification immediately
      dispatch({type: CREATE_TRUST_ANCHOR_SUCCESS, payload: anchor});
      showToast(ToastTypeEnum.TOAST_SUCCESS, {message: translate('trust_anchor_add_success_toast'), showBadge: false});
      return anchor;
    } catch (error) {
      dispatch({type: CREATE_TRUST_ANCHOR_FAILED});
      showToast(ToastTypeEnum.TOAST_ERROR, {message: `${error}`, showBadge: false});
      return Promise.reject(error);
    }
  };
};

export const removeTrustAnchor = (id: string): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: TRUST_ANCHORS_LOADING});
    try {
      await deleteTrustAnchorFromStorage(id);
      await refreshTrustAnchorRegistry();
      dispatch({type: DELETE_TRUST_ANCHOR_SUCCESS, payload: id});
    } catch (error) {
      dispatch({type: DELETE_TRUST_ANCHOR_FAILED});
      return Promise.reject(error);
    }
  };
};

export const getTrustAnchorLinks = (): ThunkAction<Promise<Array<ITrustAnchorContactLink>>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<Array<ITrustAnchorContactLink>> => {
    try {
      const links = await getTrustAnchorLinksFromStorage();
      dispatch({type: GET_TRUST_ANCHOR_LINKS_SUCCESS, payload: links});
      return links;
    } catch (error) {
      dispatch({type: GET_TRUST_ANCHOR_LINKS_FAILED});
      return Promise.reject(error);
    }
  };
};

/**
 * Best-effort: after a successful verification, link the resolved contact to any stored trust anchor
 * its certificate chain (x5c) or DID (did:web) resolves to. Never throws — linking must not break a flow.
 */
export const recordTrustAnchorLinksForVerification = (args: {
  contactId: string;
  x5cChain?: Array<string>;
  did?: string;
}): ThunkAction<Promise<Array<ITrustAnchorContactLink>>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<Array<ITrustAnchorContactLink>> => {
    const {contactId, x5cChain, did} = args;
    if (!contactId) {
      return [];
    }
    try {
      const anchors = await getTrustAnchorsFromStorage();
      if (anchors.length === 0) {
        return [];
      }
      const matches: Array<TrustAnchorMatch> = [
        ...(x5cChain && x5cChain.length > 0 ? await findTrustAnchorMatchesForX5c(x5cChain, anchors) : []),
        ...findTrustAnchorMatchesForDid(did, anchors),
      ];
      const recorded: Array<ITrustAnchorContactLink> = [];
      for (const match of matches) {
        const link = await storeRecordTrustAnchorLink({
          trustAnchorId: match.anchor.id,
          contactId,
          matchedType: match.anchor.type,
          matchedValue: match.matchedValue,
        });
        dispatch({type: RECORD_TRUST_ANCHOR_LINK_SUCCESS, payload: link});
        recorded.push(link);
      }
      return recorded;
    } catch (error) {
      // Linking is best-effort; swallow errors so a verification flow is never broken by it.
      return [];
    }
  };
};
