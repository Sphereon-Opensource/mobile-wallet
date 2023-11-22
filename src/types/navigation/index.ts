import {Format, PresentationDefinitionV1, PresentationDefinitionV2} from '@sphereon/pex-models';
import {IBasicIdentity, IContact} from '@sphereon/ssi-sdk.data-store';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';
import {OnboardingMachineContext, OnboardingPersonalData, OnboardingMachineInterpreter} from '../machines/onboarding';
import {ICredentialSelection, ICredentialSummary, ICredentialTypeSelection} from '../credential';
import {IButton, PopupBadgesEnum, PopupImagesEnum} from '../component';
import {OID4VCIMachineInterpreter} from '../machines/oid4vci';

export type StackParamList = {
  CredentialsOverview: Record<string, never>;
  CredentialDetails: ICredentialDetailsProps & IHasOnBackProps;
  CredentialRawJson: ICredentialRawJsonProps;
  QrReader: Record<string, never>;
  Veramo: Record<string, never>;
  Home: Record<string, never>;
  VerificationCode: IVerificationCodeProps & IHasOnBackProps;
  AlertModal: IAlertModalProps;
  PopupModal: IPopupModalProps;
  Error: IPopupModalProps & IHasOnBackProps;
  CredentialSelectType: ICredentialSelectTypeProps & IHasOnBackProps;
  ContactsOverview: Record<string, never>;
  ContactDetails: IContactDetailsProps;
  ContactAdd: IContactAddProps & IHasOnBackProps;
  Onboarding: IOnboardingProps;
  Main: Record<string, never>;
  Welcome: IHasOnboardingContext & IHasOnNextProps;
  TermsOfService: IHasOnboardingContext & ITermsOfServiceProps & IHasOnBackProps & IHasOnNextProps;
  PersonalData: IHasOnboardingContext & IHasOnBackProps & IPersonalDataProps;
  PinCodeSet: IPinCodeSetProps & IHasOnboardingContext & IHasOnBackProps & IHasOnNextProps;
  PinCodeVerify: IPinCodeVerifyProps & IHasOnboardingContext & IHasOnBackProps & IHasOnNextProps; // TODO this should not contain a whole context but only a pin code
  OnboardingSummary: IHasOnboardingContext & IHasOnBackProps & IHasOnNextProps;
  NotificationsOverview: Record<string, never>;
  Lock: ILockProps;
  Authentication: Record<string, never>;
  CredentialsRequired: ICredentialsRequiredProps;
  CredentialsSelect: ICredentialsSelectProps;
  Loading: ILoadingProps;
  OID4VCI: IOID4VCIProps;
};

interface IPersonalDataProps {
  isDisabled: (personalData: OnboardingPersonalData) => boolean;
  onNext: (personalData: OnboardingPersonalData) => void;
  onPersonalData: (personalData: OnboardingPersonalData) => void;
}

export interface IOnboardingProps {
  customOnboardingInstance?: OnboardingMachineInterpreter;
}

export interface IHasOnboardingContext {
  context: OnboardingMachineContext;
}

export interface IHasOnBackProps {
  onBack?: () => Promise<void>;
}

export interface ILoadingProps {
  message: string;
}

export interface IHasOnNextProps {
  onNext: (data?: any) => Promise<void>;
}

export interface ITermsOfServiceProps {
  isDisabled: () => boolean;
  onDecline: () => Promise<void>;
  onAcceptTerms: (accept: boolean) => Promise<void>;
  onAcceptPrivacy: (accept: boolean) => Promise<void>;
}

export interface ICredentialsSelectProps {
  credentialSelection: Array<ICredentialSelection>;
  purpose?: string;
  onSelect: (vcs: Array<string>) => Promise<void>;
}

export interface ICredentialsRequiredProps {
  verifier: string;
  format: Format | undefined;
  subjectSyntaxTypesSupported: string[] | undefined;
  presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2;
  onDecline: () => Promise<void>;
  onSend: (credentials: Array<OriginalVerifiableCredential>) => Promise<void>;
}

export interface ICredentialDetailsProps {
  credential: ICredentialSummary;
  primaryAction?: IButton;
  secondaryAction?: IButton;
  showActivity?: boolean;
  /*
   TODO WAL-340
   We want to keep screens simple and we want one object representing the vc to avoid mismatches.
   What we need is a list of actions that will be used for the 'more' button, where the credential is passed in.
  */
  rawCredential?: OriginalVerifiableCredential;
  headerTitle?: string;
}

export interface ICredentialRawJsonProps {
  rawCredential: VerifiableCredential;
}

export interface IVerificationCodeProps {
  pinLength?: number;
  onVerification: (pin: string) => Promise<void>;
  credentialName: string;
}

export interface IAlertModalProps {
  message: string;
  buttons: Array<IButton>;
  showCancel?: boolean;
}

export interface IPopupModalProps {
  onClose?: () => Promise<void>;
  image?: PopupImagesEnum;
  title?: string;
  titleBadge?: PopupBadgesEnum;
  details?: string;
  extraDetails?: string;
  detailsPopup?: {
    buttonCaption: string;
    title?: string;
    details?: string;
    extraDetails?: string;
  };
  primaryButton?: IButton;
  secondaryButton?: IButton;
}

export interface ICredentialSelectTypeProps {
  issuer: string;
  credentialTypes: Array<ICredentialTypeSelection>;
  onSelectType?: (credentialTypes: Array<string>) => Promise<void>;
  onSelect: (credentialTypes: Array<string>) => Promise<void>;
  isSelectDisabled?: boolean | (() => boolean);
}

export interface IContactDetailsProps {
  contact: IContact;
}

export interface IContactAddProps {
  name: string;
  uri?: string;
  identities?: Array<IBasicIdentity>;
  onCreate: (contact: IContact) => Promise<void>;
  onDecline: () => Promise<void>;
  onConsentChange?: (hasConsent: boolean) => Promise<void>;
  onAliasChange?: (alias: string) => Promise<void>;
  hasConsent?: boolean;
  isCreateDisabled?: boolean | (() => boolean);
}

export interface IPinCodeSetProps {
  headerSubTitle: string;
}

export interface IPinCodeVerifyProps {
  headerSubTitle: string;
}

export enum PinCodeMode {
  CHOOSE_PIN = 'choose_pin',
  CONFIRM_PIN = 'confirm_pin',
}
export interface ILockProps {
  onAuthenticate: () => Promise<void>;
}

export enum SwitchRoutesEnum {
  ONBOARDING = 'Onboarding',
  AUTHENTICATION = 'Authentication',
  MAIN = 'Main',
}

export enum MainRoutesEnum {
  HOME = 'Home',
  ALERT_MODAL = 'AlertModal',
  POPUP_MODAL = 'PopupModal',
  OID4VCI = 'OID4VCI',
}

export enum NavigationBarRoutesEnum {
  QR = 'QRStack',
  NOTIFICATIONS = 'NotificationsStack',
  CREDENTIALS = 'CredentialsStack',
  CONTACTS = 'ContactsStack',
}

export enum ScreenRoutesEnum {
  WELCOME = 'Welcome',
  CREDENTIALS_OVERVIEW = 'CredentialsOverview',
  CREDENTIAL_DETAILS = 'CredentialDetails',
  CREDENTIAL_RAW_JSON = 'CredentialRawJson',
  QR_READER = 'QrReader',
  VERIFICATION_CODE = 'VerificationCode',
  ERROR = 'Error',
  CREDENTIAL_SELECT_TYPE = 'CredentialSelectType',
  CONTACTS_OVERVIEW = 'ContactsOverview',
  CONTACT_DETAILS = 'ContactDetails',
  CONTACT_ADD = 'ContactAdd',
  TERMS_OF_SERVICE = 'TermsOfService',
  PERSONAL_DATA = 'PersonalData',
  PIN_CODE_SET = 'PinCodeSet',
  PIN_CODE_VERIFY = 'PinCodeVerify',
  NOTIFICATIONS_OVERVIEW = 'NotificationsOverview',
  LOCK = 'Lock',
  ONBOARDING_SUMMARY = 'OnboardingSummary',
  CREDENTIALS_REQUIRED = 'CredentialsRequired',
  CREDENTIALS_SELECT = 'CredentialsSelect',
  LOADING = 'Loading',
}

export interface IOID4VCIProps {
  customOID4VCIInstance?: OID4VCIMachineInterpreter;
}
