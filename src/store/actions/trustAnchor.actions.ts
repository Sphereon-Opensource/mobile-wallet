import {Action} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {translate} from '../../localization/Localization';
import {refreshFromStorage as refreshTrustAnchorRegistry} from '../../agent/trustAnchorRegistry';
import {
  addTrustAnchor as storeTrustAnchor,
  getTrustAnchors as getTrustAnchorsFromStorage,
  removeTrustAnchor as deleteTrustAnchorFromStorage,
} from '../../services/trustAnchor/trustAnchorService';
import {RootState, ToastTypeEnum} from '../../types';
import {
  CREATE_TRUST_ANCHOR_FAILED,
  CREATE_TRUST_ANCHOR_SUCCESS,
  DELETE_TRUST_ANCHOR_FAILED,
  DELETE_TRUST_ANCHOR_SUCCESS,
  GET_TRUST_ANCHORS_FAILED,
  GET_TRUST_ANCHORS_SUCCESS,
  TRUST_ANCHORS_LOADING,
} from '../../types/store/trustAnchor.action.types';
import {IAddTrustAnchorArgs, ITrustAnchor} from '../../types/store/trustAnchor.types';
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
