import {IUserPreferences} from '../preferences';
import {OnboardingBiometricsStatus} from '../machines/onboarding';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  identifiers: Array<IUserIdentifier>;
  createdAt: Date;
  lastUpdatedAt: Date;
  preferences: IUserPreferences;
  biometricsEnabled: OnboardingBiometricsStatus;
}

export interface BasicUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  identifiers?: Array<BasicUserIdentifier>;
  biometricsEnabled: OnboardingBiometricsStatus;
}

export interface IUserIdentifier {
  did: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}
export type BasicUserIdentifier = Omit<IUserIdentifier, 'createdAt' | 'lastUpdatedAt'>;
