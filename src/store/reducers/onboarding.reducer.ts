import { OnboardingActionTypes, SET_PERSONAL_DATA } from '../../@types/store/onboarding.action.types'
import { IOnboardingState } from '../../@types/store/onboarding.types'

const initialState: IOnboardingState = {
  firstName: undefined,
  lastName: undefined,
  emailAddress: undefined
}

const onboardingReducer = (state: IOnboardingState = initialState, action: OnboardingActionTypes): IOnboardingState => {
  switch (action.type) {
    case SET_PERSONAL_DATA: {
      return {
        ...state,
        ...action.payload
      }
    }
    default:
      return state
  }
}

export default onboardingReducer
