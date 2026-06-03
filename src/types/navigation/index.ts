import {NavigationHelpers} from '@react-navigation/native';
import {Format, PresentationDefinitionV1, PresentationDefinitionV2} from '@sphereon/pex-models';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {CredentialRole, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {NonPersistedIdentity, Party} from '@sphereon/ssi-sdk.data-store-types';
import {ImageAttributes} from '@sphereon/ui-components.core';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {VerifiableCredential} from '@veramo/core';
import {Activity} from '../activity';
import {IButton, PopupBadgesEnum, PopupImagesEnum} from '../component';
import {ICredentialSelection, ICredentialTypeSelection} from '../credential';
import {OnboardingMachineInterpreter} from '../machines/onboarding';
import {SiopV2MachineInterpreter} from '../machines/siopV2';
import {DcqlQuery} from 'dcql';

export type ParamsList = Record<string, object | undefined>;
export type Navigate<T extends ParamsList> = NavigationHelpers<T, any>['navigate'];

export type StackParamList = {
  CredentialsOverview: Record<string, never>;
  CredentialDetails: ICredentialDetailsProps & Partial<IHasOnBackProps>;
  CredentialRawJson: ICredentialRawJsonProps;
  //fixme: changed the any to an actual type
  CredentialShareOverview: ICredentialOverviewShareProps;
  QrReader: Record<string, never>;
  SHARE: Record<string, never>;
  Veramo: Record<string, never>;
  Home: Record<string, never>;
  VerificationCode: IVerificationCodeProps & Partial<IHasOnBackProps>;
  AlertModal: IAlertModalProps;
  PopupModal: IPopupModalProps;
  AusweisModal: IAusweisModalProps;
  ActivityDetails: IActivityDetailsProps;
  ActivityReveledInfo: IActivityDetailsProps;
  ACTIVATE_ESIM: Record<string, never>;
  EnterESimDetails: {
    onBack: () => Promise<void>;
    onNext: () => Promise<void>;
    onSetMsisdn: (msisdn: string) => Promise<void>;
    onSetCouplingCode: (couplingCode: string) => Promise<void>;
    msisdn?: string;
    coupledWithCode?: string;
  };
  Error: IPopupModalProps & Partial<IHasOnBackProps>;
  CredentialSelectType: ICredentialSelectTypeProps & Partial<IHasOnBackProps>;
  ContactsOverview: Record<string, never>;
  ContactDetails: IContactDetailsProps;
  ContactAdd: IContactAddProps & Partial<IHasOnBackProps>;
  ContactIdentities: IContactIdentitiesProps;
  ContactActivity: IContactActivityProps;
  CredentialActivity: ICredentialActivityProps;
  Onboarding: IOnboardingProps;
  Main: Record<string, never>;
  BrowserOpen: IBrowserOpen;
  ActivityFeed: Record<string, never>;
  Lock: ILockProps;
  Authentication: Record<string, never>;
  CredentialsRequired: ICredentialsRequiredProps & Partial<IHasOnBackProps>;
  CredentialsSelect: ICredentialsSelectProps;
  Loading: ILoadingProps;
  Emergency: Record<string, never>;
  SIOPV2: ISiopV2PProps;
  OID4VCI: Record<string, never>;
  CredentialCatalog: Record<string, never>;
  GET_PID_CREDENTIALS: Record<string, never>;
  FUNKE_C2_SHARE: Record<string, never>;
  SETTINGS: Record<string, never>;
  ACCOUNT: Record<string, never>;
  AGE_DERIVED_CLAIMS: IAgeDerivedClaimsProps;
  NewContactAdd: INewContactAddProps & Partial<IHasOnBackProps>;
  TrustAnchorsOverview: Record<string, never>;
  TrustAnchorAdd: Record<string, never>;
  [MainRoutesEnum.DC_API_CONSENT]: IDCApiConsentProps;
};

export type Document = 'terms' | 'privacy';

export type IAgeDerivedClaimsProps = {
  claims: Record<number, boolean>;
};

export interface IDCApiConsentProps {
  credential: CredentialSummary;
  origin?: string;
  onComplete: (authenticated: boolean) => void;
  skipBiometric?: boolean;
}

export type IActivityDetailsProps = {
  activity?: Activity;
  claimsCount?: number;
};

export type ICredentialActivityProps = {
  credential?: CredentialSummary;
};

export type OnboardingStackParamsList = {
  AcceptTermsAndPrivacy: Record<string, never>;
  ReadTermsAndPrivacy: {document: Document};
  EnableBiometrics: Record<string, never>;
  EnterCountry: Record<string, never>;
  EnterEmailAddress: Record<string, never>;
  EnterName: Record<string, never>;
  EnterPinCode: Record<string, never>;
  ShowProgress: Record<string, never>;
  VerifyPinCode: Record<string, never>;
  Welcome: Record<string, never>;
  ACTIVATE_ESIM: Record<string, never>;
  ImportPersonalData: IOnboardingHasTitleAndSubtitle;
  ImportDataConsent: Record<string, never>;
  PinCodeSet: Record<string, never>;
  PinCodeVerify: Record<string, never>;
  ImportDataAuthentication: Record<string, never>;
  ImportDataLoader: Record<string, never>;
  ImportDataFinal: Record<string, never>;
  IncorrectPersonalData: Record<string, never>;
  CompleteOnboarding: Record<string, never>;
  Error: IPopupModalProps & Partial<IHasOnBackProps>;
};

export type GetPIDCredentialsStackParamsList = {
  ImportDataConsent: Record<string, never> & Partial<IHasOnBackProps>;
  ImportPersonalData: IOnboardingHasTitleAndSubtitle & Partial<IHasOnBackProps>;
  ImportDataAuthentication: Record<string, never> & Partial<IHasOnBackProps>;
  ImportDataLoader: Record<string, never> & Partial<IHasOnBackProps>;
  ImportDataFinal: Record<string, never> & Partial<IHasOnBackProps>;
  IncorrectPersonalData: Record<string, never> & Partial<IHasOnBackProps>;
  ImportDataLoaderStore: Record<string, never> & Partial<IHasOnBackProps>;
  Error: IPopupModalProps & Partial<IHasOnBackProps>;
};

export type FunkeC2ShareStackParamsList = {
  Loading: ILoadingProps;
  ImportDataConsent: Record<string, never> & Partial<IHasOnBackProps>;
  ImportPersonalData: IOnboardingHasTitleAndSubtitle & Partial<IHasOnBackProps>;
  ImportDataAuthentication: Record<string, never> & Partial<IHasOnBackProps>;
  ImportDataFinal: Record<string, never> & Partial<IHasOnBackProps>;

  // IncorrectPersonalData: Record<string, never> & Partial<IHasOnBackProps>;
  // ImportDataLoaderStore: Record<string, never> & Partial<IHasOnBackProps>;
  Error: IPopupModalProps & Partial<IHasOnBackProps>;
};

export type ShareStackParamList = {
  QrPresentation: Record<string, never>;
};

export type ESIMActivationStackParamList = {
  Loading: ILoadingProps;
  EnterESimDetails: {
    onBack: () => Promise<void>;
    onNext: (msisdn: string, couplingCode: string) => Promise<void>;
    msisdn?: string;
    coupledWithCode?: string;
  };
  Error: IPopupModalProps & Partial<IHasOnBackProps>;
};

// export interface IImportDataConsentProps {
//   onAccept?: () => Promise<void>;
// }

export type CreditOverviewStackParamsList = {
  CARD: Record<string, never>;
  LIST: Record<string, never>;
};

export type ReadDocumentParamsList = Record<Document, {document: Document}>;

export type OnboardingRoute = keyof OnboardingStackParamsList;

export type IBrowserOpen = IHasOnBackProps &
  IHasOnNextProps & {
    headerCaptioni18n?: string;
    titleCaptioni18n?: string;
    bodyTexti18n?: string;
    actionNextLabeli18n?: string;
  };

export interface IOnboardingProps {
  customOnboardingInstance?: OnboardingMachineInterpreter;
}

export interface IOnboardingHasTitleAndSubtitle {
  title?: string;
  subtitle?: string;
}

export interface IHasOnBackProps {
  onClick: () => {};
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
  onSelect?: (credentials: Array<UniqueDigitalCredential>) => Promise<void>;
  onSend: (credentials: Array<OriginalVerifiableCredential>) => Promise<void>;
  isSendDisabled?: () => boolean | (() => boolean);
  verifierName: string;
}

export interface ICredentialOverviewShareProps {
  verifier: Party;
  //presentationDefinition: IPresentationDefinition;
  dcqlQuery: DcqlQuery;
  credentials: UniqueDigitalCredential[];
  onDecline: () => Promise<void>;
  onSelectAndSend: (credentials: UniqueDigitalCredential[]) => Promise<void>;
}

export interface ICredentialDetailsProps {
  credential: CredentialSummary;
  primaryAction?: IButton;
  secondaryAction?: IButton;
  hideLinks?: boolean;
  /*
   TODO WAL-340
   We want to keep screens simple and we want one object representing the vc to avoid mismatches.
   What we need is a list of actions that will be used for the 'more' button, where the credential is passed in.
  */
  rawCredential?: OriginalVerifiableCredential;
  uniqueDigitalCredential?: UniqueDigitalCredential;
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
  input?: {
    // TODO temp solution to support input on the modal
    label?: string;
    initialValue?: string;
    placeHolder?: string;
    maxLength?: number;
    onEndEditing?: (value: string) => Promise<void>;
    onValueChange?: (value: string) => Promise<void>;
  };
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

export interface IAusweisModalProps {
  onClose: () => Promise<void>;
  onAccept: () => Promise<void>;
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

export interface IContactIdentitiesProps {
  identities: Party['identities'];
}

export interface IContactActivityProps {
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

export interface INewContactAddProps {
  name: string;
  uri?: string;
  description?: string;
  clientUri?: string;
  tosUri?: string;
  policyUri?: string;
  contacts?: Array<string>;
  logo?: ImageAttributes;
  federations?: Array<Party>;
  roles?: Array<CredentialRole>;
  identities?: Array<NonPersistedIdentity>;
  onCreate?: (contact: Party) => Promise<void>;
  onContinue?: () => Promise<void>; // TODO we need to restructure this prop, so that there is only one to continue with create or not
  onDecline: () => Promise<void>;
  onAliasChange?: (alias: string) => Promise<void>;
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
  showProfileIcon?: boolean;
  onAuthenticate: () => Promise<void>;
}

export enum SwitchRoutesEnum {
  ONBOARDING = 'Onboarding',
  ACTIVATE_ESIM = 'ACTIVATE_ESIM',
  AUTHENTICATION = 'Authentication',
  MAIN = 'Main',
}

export enum MainRoutesEnum {
  HOME = 'Home',
  ALERT_MODAL = 'AlertModal',
  AUSWEIS_MODAL = 'AusweisModal',
  ACTIVATE_ESIM = 'ACTIVATE_ESIM',
  POPUP_MODAL = 'PopupModal',
  OID4VCI = 'OID4VCI',
  SIOPV2 = 'SIOPV2',
  GET_PID_CREDENTIALS = 'GET_PID_CREDENTIALS',
  FUNKE_C2_SHARE = 'FUNKE_C2_SHARE',
  SHARE = 'SHARE',
  SETTINGS = 'SETTINGS',
  ACCOUNT = 'ACCOUNT',
  AGE_DERIVED_CLAIMS = 'AGE_DERIVED_CLAIMS',
  DC_API_CONSENT = 'DCApiConsent',
}

export enum NavigationBarRoutesEnum {
  QR = 'QRStack',
  ACTIVITIES = 'ActivitiesStack',
  CREDENTIALS = 'CredentialsStack',
  CONTACTS = 'ContactsStack',
  CREDENTIAL_CATALOG = 'CredentialCatalogStack',
}
export enum ScreenRoutesEnum {
  CREDENTIALS_OVERVIEW = 'CredentialsOverview',
  CREDENTIAL_SHARE_OVERVIEW = 'CredentialShareOverview',
  CREDENTIAL_DETAILS = 'CredentialDetails',
  CREDENTIAL_RAW_JSON = 'CredentialRawJson',
  QR_READER = 'QrReader',
  QR_PRESENTATION = 'QrPresentation',
  VERIFICATION_CODE = 'VerificationCode',
  ERROR = 'Error',
  ACTIVITY_DETAILS = 'ActivityDetails',
  ACTIVITY_REVEALED_INFO = 'ActivityReveledInfo',
  CREDENTIAL_SELECT_TYPE = 'CredentialSelectType',
  CONTACTS_OVERVIEW = 'ContactsOverview',
  CONTACT_DETAILS = 'ContactDetails',
  CONTACT_ADD = 'ContactAdd',
  CONTACT_IDENTITIES = 'ContactIdentities',
  CONTACT_ACTIVITY = 'ContactActivity',
  ACTIVITY_FEED = 'ActivityFeed',
  LOCK = 'Lock',
  BROWSER_OPEN = 'BrowserOpen',
  CREDENTIALS_REQUIRED = 'CredentialsRequired',
  CREDENTIALS_SELECT = 'CredentialsSelect',
  CREDENTIAL_ACTIVITY = 'CredentialActivity',
  LOADING = 'Loading',
  EMERGENCY = 'Emergency',
  CREDENTIAL_CATALOG = 'CredentialCatalog',
  NEW_CONTACT_ADD = 'NewContactAdd',
  ENTER_ESIM_DETAILS = 'EnterESimDetails',
  TRUST_ANCHORS_OVERVIEW = 'TrustAnchorsOverview',
  TRUST_ANCHOR_ADD = 'TrustAnchorAdd',
}

export interface ISiopV2PProps {
  customSiopV2Instance?: SiopV2MachineInterpreter;
}
