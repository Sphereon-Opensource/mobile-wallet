import {IDPOPState} from '../../types/store/dpop.types';
import {CREATE_DPOP_SUCCESS, DPOP_LOADING, DPOPActionTypes} from '../../types/store/dpop.action.types';

const initialState: IDPOPState = {
  loading: false,
};

const dpopReducer = (state: IDPOPState = initialState, action: DPOPActionTypes): IDPOPState => {
  // For WAL-605 we can add sorting taking inspiration from contactReducer WAL-540

  switch (action.type) {
    case DPOP_LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    case CREATE_DPOP_SUCCESS: {
      return {
        ...state,
        dpop: action.payload.dpop,
        accessToken: action.payload.accessToken,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default dpopReducer;
