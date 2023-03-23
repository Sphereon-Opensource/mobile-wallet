import {ISetPersonalDataActionArgs} from './onboarding.types';

export const ONBOARDING_LOADING = '[ONBOARDING] ONBOARDING_LOADING';
export type ONBOARDING_LOADING = typeof ONBOARDING_LOADING;
export const SET_PERSONAL_DATA_SUCCESS = '[ONBOARDING] SET_PERSONAL_DATA_SUCCESS';
export type SET_PERSONAL_DATA_SUCCESS = typeof SET_PERSONAL_DATA_SUCCESS;
export const CLEAR_ONBOARDING = '[ONBOARDING] CLEAR_ONBOARDING';
export type CLEAR_ONBOARDING = typeof CLEAR_ONBOARDING;

interface IOnboardingLoading {
  type: ONBOARDING_LOADING;
}

interface ISetPersonalDataSuccessAction {
  type: SET_PERSONAL_DATA_SUCCESS;
  payload: ISetPersonalDataActionArgs;
}

interface IClearOnboardingAction {
  type: CLEAR_ONBOARDING;
}

export type OnboardingActionTypes = IOnboardingLoading | ISetPersonalDataSuccessAction | IClearOnboardingAction;
