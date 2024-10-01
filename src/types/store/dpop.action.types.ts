export const DPOP_LOADING = '[DPOP] DPOP_LOADING';
export type DPOP_LOADING = typeof DPOP_LOADING;
export const CREATE_DPOP_SUCCESS = '[DPOP] CREATE_DPOP_SUCCESS';
export type CREATE_DPOP_SUCCESS = typeof CREATE_DPOP_SUCCESS;

interface IDPOPLoading {
  type: DPOP_LOADING;
}

interface ICreateDPOPActionSuccessAction {
  type: CREATE_DPOP_SUCCESS;
  payload: {dpop: string; accessToken: string};
}

export type DPOPActionTypes = IDPOPLoading | ICreateDPOPActionSuccessAction;
