import {ITrustAnchor} from './trustAnchor.types';

export const TRUST_ANCHORS_LOADING = '[TRUST_ANCHOR] TRUST_ANCHORS_LOADING';
export type TRUST_ANCHORS_LOADING = typeof TRUST_ANCHORS_LOADING;
export const GET_TRUST_ANCHORS_SUCCESS = '[TRUST_ANCHOR] GET_TRUST_ANCHORS_SUCCESS';
export type GET_TRUST_ANCHORS_SUCCESS = typeof GET_TRUST_ANCHORS_SUCCESS;
export const GET_TRUST_ANCHORS_FAILED = '[TRUST_ANCHOR] GET_TRUST_ANCHORS_FAILED';
export type GET_TRUST_ANCHORS_FAILED = typeof GET_TRUST_ANCHORS_FAILED;
export const CREATE_TRUST_ANCHOR_SUCCESS = '[TRUST_ANCHOR] CREATE_TRUST_ANCHOR_SUCCESS';
export type CREATE_TRUST_ANCHOR_SUCCESS = typeof CREATE_TRUST_ANCHOR_SUCCESS;
export const CREATE_TRUST_ANCHOR_FAILED = '[TRUST_ANCHOR] CREATE_TRUST_ANCHOR_FAILED';
export type CREATE_TRUST_ANCHOR_FAILED = typeof CREATE_TRUST_ANCHOR_FAILED;
export const DELETE_TRUST_ANCHOR_SUCCESS = '[TRUST_ANCHOR] DELETE_TRUST_ANCHOR_SUCCESS';
export type DELETE_TRUST_ANCHOR_SUCCESS = typeof DELETE_TRUST_ANCHOR_SUCCESS;
export const DELETE_TRUST_ANCHOR_FAILED = '[TRUST_ANCHOR] DELETE_TRUST_ANCHOR_FAILED';
export type DELETE_TRUST_ANCHOR_FAILED = typeof DELETE_TRUST_ANCHOR_FAILED;

interface ITrustAnchorsLoading {
  type: TRUST_ANCHORS_LOADING;
}
interface IGetTrustAnchorsSuccessAction {
  type: GET_TRUST_ANCHORS_SUCCESS;
  payload: Array<ITrustAnchor>;
}
interface IGetTrustAnchorsFailedAction {
  type: GET_TRUST_ANCHORS_FAILED;
}
interface ICreateTrustAnchorSuccessAction {
  type: CREATE_TRUST_ANCHOR_SUCCESS;
  payload: ITrustAnchor;
}
interface ICreateTrustAnchorFailedAction {
  type: CREATE_TRUST_ANCHOR_FAILED;
}
interface IDeleteTrustAnchorSuccessAction {
  type: DELETE_TRUST_ANCHOR_SUCCESS;
  payload: string; // id
}
interface IDeleteTrustAnchorFailedAction {
  type: DELETE_TRUST_ANCHOR_FAILED;
}

export type TrustAnchorActionTypes =
  | ITrustAnchorsLoading
  | IGetTrustAnchorsSuccessAction
  | IGetTrustAnchorsFailedAction
  | ICreateTrustAnchorSuccessAction
  | ICreateTrustAnchorFailedAction
  | IDeleteTrustAnchorSuccessAction
  | IDeleteTrustAnchorFailedAction;
