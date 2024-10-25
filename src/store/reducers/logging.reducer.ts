import {ILoggingState} from '../../types/store/logging.types';
import {
  STORE_ACTIVITY_LOGGING_FAILED,
  STORE_ACTIVITY_LOGGING_SUCCESS,
  GET_ACTIVITY_LOGGING_FAILED,
  GET_ACTIVITY_LOGGING_SUCCESS,
  LOGGING_LOADING,
  LoggingActionTypes,
} from '../../types/store/logging.action.types';

const initialState: ILoggingState = {
  loading: false,
  activityLogging: [],
};

const loggingReducer = (state: ILoggingState = initialState, action: LoggingActionTypes): ILoggingState => {
  switch (action.type) {
    case LOGGING_LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_ACTIVITY_LOGGING_SUCCESS: {
      return {
        ...state,
        activityLogging: action.payload,
        loading: false,
      };
    }
    case GET_ACTIVITY_LOGGING_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case STORE_ACTIVITY_LOGGING_SUCCESS: {
      return {
        ...state,
        activityLogging: [...state.activityLogging, action.payload],
        loading: false,
      };
    }
    case STORE_ACTIVITY_LOGGING_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default loggingReducer;
