import {CLEAR_ONBOARDING, ONBOARDING_LOADING, OnboardingActionTypes, SET_PERSONAL_DATA_SUCCESS} from '../../types/store/onboarding.action.types';
import {IOnboardingState} from '../../types/store/onboarding.types';

const initialState: IOnboardingState = {
  loading: false,
  firstName: undefined,
  lastName: undefined,
  emailAddress: undefined,
};

const onboardingReducer = (state: IOnboardingState = initialState, action: OnboardingActionTypes): IOnboardingState => {
  switch (action.type) {
    case ONBOARDING_LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    case CLEAR_ONBOARDING: {
      return initialState;
    }
    case SET_PERSONAL_DATA_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default onboardingReducer;
