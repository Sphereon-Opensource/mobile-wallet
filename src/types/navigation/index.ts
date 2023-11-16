import {Format, PresentationDefinitionV1, PresentationDefinitionV2} from '@sphereon/pex-models';
import {IBasicIdentity, IContact} from '@sphereon/ssi-sdk.data-store';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {VerifiableCredential} from '@veramo/core';

import {
  IButton,
  ICredentialSelection,
  ICredentialSummary,
  ICredentialTypeSelection,
  OID4VCIMachineInterpreter,
  PopupBadgesEnum,
  PopupImagesEnum,
} from '../index';

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
  Onboarding: Record<string, never>;
  Welcome: Record<string, never>;
  Main: Record<string, never>;
  TermsOfService: Record<string, never>;
  PersonalData: Record<string, never>;
  PinCodeSet: IPinCodeSetProps;
  NotificationsOverview: Record<string, never>;
  Lock: ILockProps;
  Authentication: Record<string, never>;
  OnboardingSummary: Record<string, never>;
  CredentialsRequired: ICredentialsRequiredProps;
  CredentialsSelect: ICredentialsSelectProps;
  Loading: ILoadingProps;
  OID4VCI: Record<string, never>; // TODO
  OID4VCIStack: IOID4VCIProps; // TODO
};

export interface IHasOnBackProps {
  onBack?: () => Promise<void>;
}

export interface ILoadingProps {
  message: string;
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
}

export enum NavigationBarRoutesEnum {
  QR = 'QRStack',
  NOTIFICATIONS = 'NotificationsStack',
  CREDENTIALS = 'CredentialsStack',
  CONTACTS = 'ContactsStack',
}

export enum QRRoutesEnum {
  OID4VCI = 'OID4VCIStack',
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
