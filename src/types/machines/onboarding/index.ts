import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CredentialPayload, ProofFormat} from '@veramo/core';
import {ReactNode} from 'react';
import {Interpreter, State, StatesConfig} from 'xstate';
import {OnboardingStackParamsList} from '../../navigation';
import {SupportedDidMethodEnum} from '../../did';
import VciServiceFunkeCProvider from '../../../providers/authentication/funke/VciServiceFunkeCProvider';
import {IVerifiableCredential} from '@sphereon/ssi-types';
import {ErrorDetails} from '../../error';

export type OnboardingCredentialData = {
  didMethod: SupportedDidMethodEnum;
  didOptions?: any;
  credential?: Partial<CredentialPayload>;
  proofFormat?: ProofFormat;
};

export enum Country {
  DEUTSCHLAND = 'DEUTSCHLAND',
}

export enum OnboardingMachineStep {
  CREATE_WALLET = 1,
  SECURE_WALLET = 2,
  IMPORT_PERSONAL_DATA = 3,
  FINAL = 4,
}

export enum OnboardingBiometricsStatus {
  INDETERMINATE = 1,
  ENABLED = 2,
  DISABLED = 3,
}

export type OnboardingMachineContext = {
  credentialData: OnboardingCredentialData;
  name: string;
  emailAddress: string;
  country?: Country;
  pinCode: string;
  biometricsEnabled: OnboardingBiometricsStatus;
  verificationPinCode: string;
  termsAndPrivacyAccepted: boolean;
  currentStep: OnboardingMachineStep;
  funkeProvider?: VciServiceFunkeCProvider;
  pidCredentials: Array<MappedCredential>;
  error?: ErrorDetails;
};

// States
export enum OnboardingMachineStateType {
  showIntro = 'showIntro',
  showProgress = 'showProgress',
  enterName = 'enterName',
  enterEmailAddress = 'enterEmailAddress',
  enterCountry = 'enterCountry',
  enterPinCode = 'enterPinCode',
  verifyPinCode = 'verifyPinCode',
  enableBiometrics = 'enableBiometrics',
  acceptTermsAndPrivacy = 'acceptTermsAndPrivacy',
  readTerms = 'readTerms',
  readPrivacy = 'readPrivacy',
  importDataConsent = 'importDataConsent',
  importPersonalData = 'importPersonalData',
  importDataAuthentication = 'importDataAuthentication',
  retrievePIDCredentials = 'retrievePIDCredentials',
  importDataFinal = 'importDataFinal',
  storePIDCredentials = 'storePIDCredentials',
  handleError = 'handleError',
  error = 'error',
  done = 'done',
}

export type OnboardingMachineStates = Record<OnboardingMachineStateType, {}>;

// Events
export enum OnboardingMachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  SET_NAME = 'SET_NAME',
  SET_EMAIL_ADDRESS = 'SET_EMAIL_ADDRESS',
  SET_COUNTRY = 'SET_COUNTRY',
  SET_PIN_CODE = 'SET_PIN_CODE',
  SET_VERIFICATION_PIN_CODE = 'SET_VERIFICATION_PIN_CODE',
  READ_TERMS = 'READ_TERMS',
  READ_PRIVACY = 'READ_PRIVACY',
  SKIP_IMPORT = 'SKIP_IMPORT',
  SET_BIOMETRICS = 'SET_BIOMETRICS',
  SKIP_BIOMETRICS = 'SKIP_BIOMETRICS',
  SET_FUNKE_PROVIDER = 'SET_FUNKE_PROVIDER',
}

export type NextEvent = {type: OnboardingMachineEvents.NEXT};
export type PreviousEvent = {type: OnboardingMachineEvents.PREVIOUS};
export type SetNameEvent = {type: OnboardingMachineEvents.SET_NAME; data: string};
export type SetEmailAddressEvent = {type: OnboardingMachineEvents.SET_EMAIL_ADDRESS; data: string};
export type SetCountryEvent = {type: OnboardingMachineEvents.SET_COUNTRY; data: Country};
export type SetPinCodeEvent = {type: OnboardingMachineEvents.SET_PIN_CODE; data: string};
export type SetVerificationPinCodeEvent = {type: OnboardingMachineEvents.SET_VERIFICATION_PIN_CODE; data: string};
export type ReadTermsEvent = {type: OnboardingMachineEvents.READ_TERMS};
export type ReadPrivacyEvent = {type: OnboardingMachineEvents.READ_PRIVACY};
export type SkipImportEvent = {type: OnboardingMachineEvents.SKIP_IMPORT};
export type SkipBiometricsEvent = {type: OnboardingMachineEvents.SKIP_BIOMETRICS};
export type SetBiometricsEvent = {type: OnboardingMachineEvents.SET_BIOMETRICS; data: OnboardingBiometricsStatus};
export type SetFunkeProvider = {type: OnboardingMachineEvents.SET_FUNKE_PROVIDER; data: VciServiceFunkeCProvider};

export type OnboardingMachineEventTypes =
  | NextEvent
  | PreviousEvent
  | SetNameEvent
  | SetEmailAddressEvent
  | SetCountryEvent
  | SetPinCodeEvent
  | SetVerificationPinCodeEvent
  | ReadTermsEvent
  | ReadPrivacyEvent
  | SkipImportEvent
  | SkipBiometricsEvent
  | SetBiometricsEvent
  | SetFunkeProvider;

// Guards
export enum OnboardingMachineGuards {
  isStepCreateWallet = 'isStepCreateWallet',
  isStepSecureWallet = 'isStepSecureWallet',
  isBiometricsEnabled = 'isBiometricsEnabled',
  isBiometricsDisabled = 'isBiometricsDisabled',
  isBiometricsUndetermined = 'isBiometricsUndetermined',
  isNameValid = 'isNameValid',
  isEmailValid = 'isEmailValid',
  isCountryValid = 'isCountryValid',
  isPinCodeValid = 'isPinCodeValid',
  doPinsMatch = 'doPinsMatch',
  isStepImportPersonalData = 'isStepImportPersonalData',
  hasFunkeRefreshUrl = 'hasFunkeRefreshUrl',
}

export enum OnboardingMachineServices {
  retrievePIDCredentials = 'retrievePIDCredentials',
  storePIDCredentials = 'storePIDCredentials',
}

// States Config
export type OnboardingStatesConfig = StatesConfig<OnboardingMachineContext, {states: OnboardingMachineStates}, OnboardingMachineEventTypes, any>;

// We use this in class components, as there is no context available there. It is also used by default in the onboarding provider

export type OnboardingMachineInterpreter = Interpreter<
  OnboardingMachineContext,
  {states: OnboardingMachineStates},
  OnboardingMachineEventTypes,
  {
    value: any;
    context: OnboardingMachineContext;
  },
  any
>;

export type OnboardingContext = {
  onboardingInstance: OnboardingMachineInterpreter;
};

export type CreateOnboardingMachineOpts = Partial<OnboardingCredentialData> & {
  credentialData?: OnboardingCredentialData;
  machineId?: string;
};

export type InstanceOnboardingMachineOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & CreateOnboardingMachineOpts;

export type OnboardingMachineState = State<
  OnboardingMachineContext,
  OnboardingMachineEventTypes,
  {states: OnboardingMachineStates},
  {value: any; context: OnboardingMachineContext},
  any
>;

export type OnboardingMachineNavigationArgs = {
  navigation: NativeStackNavigationProp<OnboardingStackParamsList>;
  context: OnboardingMachineContext;
};

export type OnboardingProviderProps = {
  children?: ReactNode;
  customOnboardingInstance?: OnboardingMachineInterpreter;
};

export type MappedCredential = {
  uniformCredential: IVerifiableCredential;
  rawCredential: string;
};
