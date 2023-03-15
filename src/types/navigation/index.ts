import { VerifiedAuthorizationRequest } from '@sphereon/did-auth-siop'
import { CorrelationIdentifierEnum, IContact } from '@sphereon/ssi-sdk-data-store'
import { VerifiableCredential } from '@veramo/core'

import {
  IButton,
  IConnectionViewItem,
  ICredentialSummary,
  ICredentialTypeSelection,
  PopupBadgesEnum,
  PopupImagesEnum
} from '../index'

export type StackParamList = {
  CredentialsOverview: Record<string, never>
  CredentialDetails: ICredentialDetailsProps
  CredentialRawJson: ICredentialRawJsonProps
  ConnectionsOverview: Record<string, never>
  // TODO create interface like bellow and fix this omit, define better interfaces
  ConnectionDetails: Omit<IConnectionViewItem, 'connectionStatus'>
  PexVerification: IPexVerificationProps
  QrReader: Record<string, never>
  Veramo: Record<string, never>
  Home: Record<string, never>
  VerificationCode: IVerificationCodeProps
  AlertModal: IAlertModalProps
  PopupModal: IPopupModalProps
  Error: IPopupModalProps
  CredentialSelectType: ICredentialSelectTypeProps
  ContactsOverview: Record<string, never>
  ContactDetails: IContactDetailsProps
  ContactAdd: IContactAddProps
  Onboarding: Record<string, never>
  Welcome: Record<string, never>
  Main: Record<string, never>
  TermsOfService: Record<string, never>
  PersonalData: Record<string, never>
  PinCodeSet: IPinCodeSetProps
  NotificationsOverview: Record<string, never>
  Lock: Record<string, never>
  Authentication: Record<string, never>
  OnboardingSummary: Record<string, never>
}

export interface ICredentialDetailsProps {
  credential: ICredentialSummary
  primaryAction?: IButton
  secondaryAction?: IButton
  showActivity?: boolean
  /*
   TODO WAL-340
   We want to keep screens simple and we want one object representing the vc to avoid mismatches.
   What we need is a list of actions that will be used for the 'more' button, where the credential is passed in.
  */
  rawCredential?: VerifiableCredential
}

export interface ICredentialRawJsonProps {
  rawCredential: VerifiableCredential
}

export interface IPexVerificationProps {
  request: VerifiedAuthorizationRequest
  sessionId: string
}

export interface IVerificationCodeProps {
  pinLength?: number
  onVerification: (pin: string) => Promise<void>
  credentialName: string
}

export interface IAlertModalProps {
  message: string
  buttons: Array<IButton>
  showCancel?: boolean
}

export interface IPopupModalProps {
  onClose?: () => Promise<void>
  image?: PopupImagesEnum
  title?: string
  titleBadge?: PopupBadgesEnum
  details?: string
  extraDetails?: string
  detailsPopup?: {
    buttonCaption: string
    title?: string
    details?: string
    extraDetails?: string
  }
  primaryButton?: IButton
  secondaryButton?: IButton
}

export interface ICredentialSelectTypeProps {
  issuer: string
  credentialTypes: Array<ICredentialTypeSelection>
  onAccept: (credentialTypes: Array<string>) => Promise<void>
}

export interface IContactDetailsProps {
  contact: IContact
}

export interface IContactAddProps {
  name: string
  uri?: string
  identifier: {
    type: CorrelationIdentifierEnum
    correlationId: string
  }
  onCreate: () => Promise<void>
}

export interface IPinCodeSetProps {
  headerSubTitle: string
}

export enum SwitchRoutesEnum {
  ONBOARDING = 'Onboarding',
  AUTHENTICATION = 'Authentication',
  MAIN = 'Main'
}

export enum MainRoutesEnum {
  HOME = 'Home',
  ALERT_MODAL = 'AlertModal',
  POPUP_MODAL = 'PopupModal'
}

export enum NavigationBarRoutesEnum {
  QR = 'QRStack',
  NOTIFICATIONS = 'NotificationsStack',
  CREDENTIALS = 'CredentialsStack',
  CONTACTS = 'ContactsStack'
}

export enum ScreenRoutesEnum {
  WELCOME = 'Welcome',
  CREDENTIALS_OVERVIEW = 'CredentialsOverview',
  CREDENTIAL_DETAILS = 'CredentialDetails',
  CREDENTIAL_RAW_JSON = 'CredentialRawJson',
  QR_READER = 'QrReader',
  VERIFICATION_CODE = 'VerificationCode',
  PEX_VERIFICATION = 'PexVerification',
  CONNECTION_DETAILS = 'ConnectionDetails',
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
  ONBOARDING_SUMMARY = 'OnboardingSummary'
}
