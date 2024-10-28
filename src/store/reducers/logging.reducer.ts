import {ILoggingState} from '../../types/store/logging.types';
import {
  STORE_ACTIVITY_LOGGING_FAILED,
  STORE_ACTIVITY_LOGGING_SUCCESS,
  GET_ACTIVITY_LOGGING_FAILED,
  GET_ACTIVITY_LOGGING_SUCCESS,
  LOGGING_LOADING,
  LoggingActionTypes,
  GET_AUDIT_LOGGING_SUCCESS,
  GET_AUDIT_LOGGING_FAILED,
  STORE_AUDIT_LOGGING_SUCCESS,
  STORE_AUDIT_LOGGING_FAILED,
} from '../../types/store/logging.action.types';

const initialState: ILoggingState = {
  loading: false,
  activityLogging: [],
  auditLogging: [],
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
    case GET_AUDIT_LOGGING_SUCCESS: {
      return {
        ...state,
        auditLogging: action.payload,
        loading: false,
      };
    }
    case GET_AUDIT_LOGGING_FAILED: {
      return {
        ...state,
        loading: false,
      };
    }
    case STORE_AUDIT_LOGGING_SUCCESS: {
      return {
        ...state,
        auditLogging: [...state.auditLogging, action.payload],
        loading: false,
      };
    }
    case STORE_AUDIT_LOGGING_FAILED: {
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
