export interface IOnboardingState {
  loading: boolean;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
}

export interface ISetPersonalDataActionArgs {
  firstName: string;
  lastName: string;
  emailAddress: string;
}
