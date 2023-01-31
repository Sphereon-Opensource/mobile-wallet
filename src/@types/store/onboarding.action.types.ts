import { ISetPersonalDataActionPayload } from './onboarding.types'

export const SET_PERSONAL_DATA = '[ONBOARDING] SET_PERSONAL_DATA'
export type SET_PERSONAL_DATA = typeof SET_PERSONAL_DATA

interface ISetPersonalDataAction {
  type: SET_PERSONAL_DATA
  payload: ISetPersonalDataActionPayload
}

export type OnboardingActionTypes = ISetPersonalDataAction
