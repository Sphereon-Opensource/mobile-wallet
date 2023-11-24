import {CredentialPayload, IIdentifier, ProofFormat, VerifiableCredential} from '@veramo/core';
import {Interpreter, State} from 'xstate';
import {SupportedDidMethodEnum} from '../../did';
import {ISetPersonalDataActionArgs} from '../../store/onboarding.types';
import {IUser} from '../../user';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ReactNode} from 'react';

export type OnboardingCredentialData = {
  didMethod: SupportedDidMethodEnum;
  credential?: Partial<CredentialPayload>;
  proofFormat?: ProofFormat;
};

export type OnboardingPersonalData = {
  firstName: string;
  lastName: string;
  emailAddress: string;
};

export type OnboardingMachineContext = {
  credentialData: OnboardingCredentialData;
  termsConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  pinCode: string;
  personalData: OnboardingPersonalData;
};

export enum OnboardingStates {
  showIntro = 'showIntro',
  acceptAgreement = 'acceptAgreement',
  enterPersonalDetails = 'enterPersonalDetails',
  verifyPersonalDetails = 'verifyPersonalDetails',
  declineOnboarding = 'declineOnboarding',
  finishOnboarding = 'finishOnboarding',
  enterPin = 'enterPin',
  verifyPin = 'verifyPin',
  setupWallet = 'setupWallet',
}

export enum OnboardingEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  DECLINE = 'DECLINE',
  SET_TOC = 'SET_TOC',
  SET_POLICY = 'SET_POLICY',
  SET_PERSONAL_DATA = 'SET_PERSONAL_DATA',
  SET_PIN = 'SET_PIN',
}

export type NextEvent = {type: OnboardingEvents.NEXT; data?: any};
export type PreviousEvent = {type: OnboardingEvents.PREVIOUS};
export type PersonalDataEvent = {type: OnboardingEvents.SET_PERSONAL_DATA; data: ISetPersonalDataActionArgs};
export type TermsConditionsEvent = {type: OnboardingEvents.SET_TOC; data: boolean};
export type PrivacyPolicyEvent = {type: OnboardingEvents.SET_POLICY; data: boolean};
export type PinSetEvent = {type: OnboardingEvents.SET_PIN; data: string};
export type DeclineEvent = {type: OnboardingEvents.DECLINE};
export type OnboardingEventTypes =
  | NextEvent
  | PreviousEvent
  | TermsConditionsEvent
  | PrivacyPolicyEvent
  | PersonalDataEvent
  | PinSetEvent
  | DeclineEvent;

export enum OnboardingGuards {
  onboardingToSAgreementGuard = 'onboardingToSAgreementGuard',
  onboardingPersonalDataGuard = 'onboardingPersonalDataGuard',
  onboardingPinCodeSetGuard = 'onboardingPinCodeSetGuard',
  onboardingPinCodeVerifyGuard = 'onboardingPinCodeVerifyGuard',
}

export type WalletSetupServiceResult = {
  identifier: IIdentifier;
  storedUser: IUser;
  verifiableCredential: VerifiableCredential;
};

// We use this in class components, as there is no context available there. It is also used by default in the onboarding provider

export type OnboardingMachineInterpreter = Interpreter<
  OnboardingMachineContext,
  any,
  OnboardingEventTypes,
  {
    value: any;
    context: OnboardingMachineContext;
  },
  any
>;

export type OnboardingContext = {
  onboardingInstance: OnboardingMachineInterpreter;
};

export type CreateOnboardingMachineOpts = {
  credentialData?: Partial<OnboardingCredentialData>;
  machineId?: string;
};

export type InstanceOnboardingMachineOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & CreateOnboardingMachineOpts;

export type OnboardingMachineState = State<OnboardingMachineContext, OnboardingEventTypes, any, {value: any; context: OnboardingMachineContext}, any>;

export type OnboardingMachineNavigationArgs = {
  onboardingMachine: OnboardingMachineInterpreter;
  state: OnboardingMachineState;
  navigation: NativeStackNavigationProp<any>;
  context: OnboardingMachineContext;
  onNext?: () => void;
  onBack?: () => void;
};

export type OnboardingProviderProps = {
  children?: ReactNode;
  customOnboardingInstance?: OnboardingMachineInterpreter;
};
