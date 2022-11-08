import { SIOP } from '@sphereon/did-auth-siop'
import { VerifiableCredential } from '@veramo/core'

import {
  CredentialIssuanceStateEnum,
  IButton,
  IConnectionViewItem,
  ICredentialSummary,
  PopupBadgesEnum,
  PopupImagesEnum
} from '../index'

// TODO create interfaces for the screens
export type StackParamList = {
  CredentialsOverview: Record<string, never>
  CredentialDetails: {
    state?: CredentialIssuanceStateEnum
    rawCredential?: VerifiableCredential
    credential: ICredentialSummary
  }
  CredentialRawJson: {
    rawCredential: VerifiableCredential
  }
  ConnectionsOverview: Record<string, never>
  // TODO fix this omit, define better interfaces
  ConnectionDetails: Omit<IConnectionViewItem, 'connectionStatus'>
  PexVerification: {
    request: SIOP.VerifiedAuthenticationRequestWithJWT
    sessionId: string
  }
  QrReader: Record<string, never>
  Veramo: Record<string, never>
  Main: Record<string, never>
  VerificationCode: {
    pinLength?: number
    onVerification: (pin: string) => Promise<void>
    credentialName: string
  }
  AlertModal: {
    message: string
    buttons: Array<IButton>
    showCancel?: boolean
  }
  PopupModal: {
    closeButtonOnPress?: () => Promise<void>
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
}

export enum RootRoutesEnum {
  MAIN = 'Main',
  ALERT_MODAL = 'AlertModal',
  POPUP_MODAL = 'PopupModal'
}

export enum NavigationBarRoutesEnum {
  QR = 'QRStack',
  NOTIFICATIONS = 'NotificationsStack',
  HOME = 'HomeStack',
  CONNECTIONS = 'ConnectionsStack'
}

export enum HomeRoutesEnum {
  CREDENTIALS_OVERVIEW = 'CredentialsOverview',
  CREDENTIAL_DETAILS = 'CredentialDetails',
  CREDENTIAL_RAW_JSON = 'CredentialRawJson'
}

export enum QrRoutesEnum {
  QR_READER = 'QrReader',
  VERIFICATION_CODE = 'VerificationCode',
  PEX_VERIFICATION = 'PexVerification'
}

export enum ConnectionRoutesEnum {
  CONNECTIONS_OVERVIEW = 'ConnectionsOverview',
  CONNECTION_DETAILS = 'ConnectionDetails'
}
