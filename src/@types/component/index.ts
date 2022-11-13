import { ComponentType } from 'react'

import { ConnectionStatusEnum } from '../connection'
import { CredentialStatusEnum, IssuerStatusEnum } from '../credential'

export enum ButtonIconsEnum {
  BACK = 'back',
  MORE = 'more',
  CLOSE = 'close'
}

export enum PopupImagesEnum {
  SECURITY = 'security'
}

export enum PopupBadgesEnum {
  CHECK_MARK = 'checkMark',
  EXCLAMATION_MARK = 'exclamationMark'
}

export interface IHeaderProps {
  showBorder: boolean
}

export interface IButton {
  caption: string
  onPress: () => Promise<void>
}

export type LabelStatus = CredentialStatusEnum | IssuerStatusEnum | ConnectionStatusEnum

export interface ITabRoute {
  key: string
  title: string
}

export interface ITabViewRoute extends ITabRoute {
  content: ComponentType<unknown>
}
