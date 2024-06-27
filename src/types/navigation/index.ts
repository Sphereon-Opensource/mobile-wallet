import {Format, PresentationDefinitionV1, PresentationDefinitionV2} from '@sphereon/pex-models';
import {NonPersistedIdentity, Party} from '@sphereon/ssi-sdk.data-store';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';
import {IButton, PopupBadgesEnum, PopupImagesEnum} from '../component';
import {ICredentialSelection, ICredentialTypeSelection} from '../credential';
import {OnboardingMachineContext, OnboardingMachineInterpreter, OnboardingPersonalData} from '../machines/onboarding';
import {SiopV2MachineInterpreter} from '../machines/siopV2';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

export type StackParamList = {
  CredentialsOverview: Record<string, never>;
  CredentialDetails: ICredentialDetailsProps & Partial<IHasOnBackProps>;
  CredentialRawJson: ICredentialRawJsonProps;
  QrReader: Record<string, never>;
  Veramo: Record<string, never>;
  Home: Record<string, never>;
  VerificationCode: IVerificationCodeProps & Partial<IHasOnBackProps>;
  AlertModal: IAlertModalProps;
  PopupModal: IPopupModalProps;
  Error: IPopupModalProps & Partial<IHasOnBackProps>;
  CredentialSelectType: ICredentialSelectTypeProps & Partial<IHasOnBackProps>;
  ContactsOverview: Record<string, never>;
  ContactDetails: IContactDetailsProps;
  ContactAdd: IContactAddProps & Partial<IHasOnBackProps>;
  Onboarding: IOnboardingProps;
  Main: Record<string, never>;
  Welcome: IHasOnboardingContext & IHasOnNextProps;
  TermsOfService: IHasOnboardingContext & ITermsOfServiceProps & IHasOnBackProps & IHasOnNextProps;
  PersonalData: IHasOnboardingContext & IHasOnBackProps & IPersonalDataProps;
  PinCodeSet: IPinCodeSetProps & IHasOnboardingContext & IHasOnBackProps & IHasOnNextProps; // TODO WAL-677 also partials for IHasOnBackProps?
  PinCodeVerify: IPinCodeVerifyProps & IHasOnboardingContext & IHasOnBackProps & IHasOnNextProps; // TODO WAL-677 this should not contain a whole context but only a pin code
  OnboardingSummary: IHasOnboardingContext & IHasOnBackProps & IHasOnNextProps;
  BrowserOpen: IBrowserOpen;
  NotificationsOverview: Record<string, never>;
  Lock: ILockProps;
  Authentication: Record<string, never>;
  CredentialsRequired: ICredentialsRequiredProps & Partial<IHasOnBackProps>;
  CredentialsSelect: ICredentialsSelectProps;
  Loading: ILoadingProps;
  Emergency: Record<string, never>;
  SIOPV2: ISiopV2PProps;
  OID4VCI: Record<string, never>;
};

export type IBrowserOpen = IHasOnBackProps &
  IHasOnNextProps & {
    headerCaptioni18n?: string;
    titleCaptioni18n?: string;
    bodyTexti18n?: string;
    actionNextLabeli18n?: string;
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
  onBack: () => Promise<void>;
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
  format: Format | undefined;
  subjectSyntaxTypesSupported: string[] | undefined;
  presentationDefinition: PresentationDefinitionV1 | PresentationDefinitionV2;
  onDecline: () => Promise<void>;
  onSelect?: (credentials: Array<OriginalVerifiableCredential>) => Promise<void>;
  onSend: (credentials: Array<OriginalVerifiableCredential>) => Promise<void>;
  isSendDisabled?: () => boolean | (() => boolean);
  verifierName: string;
}

export interface ICredentialDetailsProps {
  credential: CredentialSummary;
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
  contact: Party;
}

export interface IContactAddProps {
  name: string;
  uri?: string;
  identities?: Array<NonPersistedIdentity>;
  onCreate: (contact: Party) => Promise<void>;
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
  SIOPV2 = 'SIOPV2',
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
  BROWSER_OPEN = 'BrowserOpen',
  CREDENTIALS_REQUIRED = 'CredentialsRequired',
  CREDENTIALS_SELECT = 'CredentialsSelect',
  LOADING = 'Loading',
  EMERGENCY = 'Emergency',
}

export interface ISiopV2PProps {
  customSiopV2Instance?: SiopV2MachineInterpreter;
}
