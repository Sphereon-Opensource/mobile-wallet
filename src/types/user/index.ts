import {IUserPreferences} from '../preferences';
import {OnboardingBiometricsStatus} from '../machines/onboarding';
import {TCountryCode} from 'countries-list';

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
  countryCode: TCountryCode;
}

export interface BasicUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  identifiers?: Array<BasicUserIdentifier>;
  biometricsEnabled: OnboardingBiometricsStatus;
  countryCode: TCountryCode;
}

export interface IUserIdentifier {
  did: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}
export type BasicUserIdentifier = Omit<IUserIdentifier, 'createdAt' | 'lastUpdatedAt'>;
