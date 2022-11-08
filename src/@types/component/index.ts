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
