import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TCountryCode} from 'countries-list';
import {ReactNode} from 'react';
import {Interpreter, State, StatesConfig} from 'xstate';
import VciServiceFunkeCProvider from '../../../providers/authentication/funke/VciServiceFunkeCProvider';
import {ErrorDetails} from '../../error';
import {OnboardingStackParamsList} from '../../navigation';
import {IUser} from '../../user';
import {MappedCredential} from '../getPIDCredentialMachine';
import {PIDSecurityModel} from '../../../services/storageService';
import {CredentialPayload, ProofFormat} from '@veramo/core';
import {SupportedDidMethodEnum} from '../../did';

export type OnboardingCredentialData = {
  didMethod: SupportedDidMethodEnum;
  didOptions?: any;
  credential?: Partial<CredentialPayload>;
  proofFormat?: ProofFormat;
};

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
  countryCode: TCountryCode;
  pinCode: string;
  biometricsEnabled: OnboardingBiometricsStatus;
  verificationPinCode: string;
  termsAndPrivacyAccepted: boolean;
  currentStep: OnboardingMachineStep;
  skipImport: boolean;
  pidSecurityModel: PIDSecurityModel;
  funkeProvider?: VciServiceFunkeCProvider;
  pidCredentials: Array<MappedCredential>;
  error?: ErrorDetails;
  popupMenuOpen?: boolean;
  esimActivationAborted?: boolean;
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
  activateESim = 'activateESim',
  importPIDDataConsent = 'importPIDDataConsent',
  importPIDDataNFC = 'importPIDDataNFC',
  importPIDDataAuthentication = 'importPIDDataAuthentication',
  retrievePIDCredentials = 'retrievePIDCredentials',
  reviewPIDCredentials = 'reviewPIDCredentials',
  declinePIDCredentials = 'declinePIDCredentials',
  completeOnboarding = 'completeOnboarding',
  storePIDCredentials = 'storePIDCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  setupWallet = 'setupWallet',
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
  UPDATE_SECURITY_MODEL = 'UPDATE_SECURITY_MODEL',
  SKIP_IMPORT = 'SKIP_IMPORT',
  READ_TERMS = 'READ_TERMS',
  READ_PRIVACY = 'READ_PRIVACY',
  SET_BIOMETRICS = 'SET_BIOMETRICS',
  SKIP_BIOMETRICS = 'SKIP_BIOMETRICS',
  DECLINE_INFORMATION = 'DECLINE_INFORMATION',
  SET_FUNKE_PROVIDER = 'SET_FUNKE_PROVIDER',
  SET_POPUP_MENU_OPEN = 'SET_POPUP_MENU_OPEN',
}

export type NextEvent = {type: OnboardingMachineEvents.NEXT};
export type PreviousEvent = {type: OnboardingMachineEvents.PREVIOUS};
export type SetNameEvent = {type: OnboardingMachineEvents.SET_NAME; data: string};
export type SetEmailAddressEvent = {type: OnboardingMachineEvents.SET_EMAIL_ADDRESS; data: string};
export type SetCountryEvent = {type: OnboardingMachineEvents.SET_COUNTRY; data: TCountryCode};
export type SetPinCodeEvent = {type: OnboardingMachineEvents.SET_PIN_CODE; data: string};
export type SetVerificationPinCodeEvent = {type: OnboardingMachineEvents.SET_VERIFICATION_PIN_CODE; data: string};
export type ReadTermsEvent = {type: OnboardingMachineEvents.READ_TERMS};
export type ReadPrivacyEvent = {type: OnboardingMachineEvents.READ_PRIVACY};
export type SkipImportEvent = {type: OnboardingMachineEvents.SKIP_IMPORT};
export type SkipBiometricsEvent = {type: OnboardingMachineEvents.SKIP_BIOMETRICS};
export type SetBiometricsEvent = {type: OnboardingMachineEvents.SET_BIOMETRICS; data: OnboardingBiometricsStatus};
export type DeclineInformation = {type: OnboardingMachineEvents.DECLINE_INFORMATION};
export type SetFunkeProvider = {type: OnboardingMachineEvents.SET_FUNKE_PROVIDER; data: VciServiceFunkeCProvider};
export type SetPopupMenuOpen = {type: OnboardingMachineEvents.SET_POPUP_MENU_OPEN; data: boolean};
export type SetSecurityModel = {
  type: OnboardingMachineEvents.UPDATE_SECURITY_MODEL;
  model: PIDSecurityModel;
};

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
  | DeclineInformation
  | SetFunkeProvider
  | SetSecurityModel
  | SetPopupMenuOpen;

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
  isStepComplete = 'isStepComplete',
  isSkipImport = 'isSkipImport',
  isESimSecurity = 'isESimSecurity',
  isEidDuringPresentation = 'isEidDuringPresentation',
  isSecureElement = 'isSecureElement',
  isImportData = 'isImportData',
  hasFunkeRefreshUrl = 'hasFunkeRefreshUrl',
}

export enum OnboardingMachineServices {
  retrievePIDCredentials = 'retrievePIDCredentials',
  storePIDCredentials = 'storePIDCredentials',
  setupWallet = 'setupWallet',
  storeCredentialBranding = 'storeCredentialBranding',
  activateESim = 'activateESim',
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

export type WalletSetupServiceResult = {
  storedUser: IUser;
};
