export interface IOnboardingState {
  firstName: string | undefined
  lastName: string | undefined
  emailAddress: string | undefined
}

export interface ISetPersonalDataActionPayload {
  firstName: string
  lastName: string
  emailAddress: string
}


