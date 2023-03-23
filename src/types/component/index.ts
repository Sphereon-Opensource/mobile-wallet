import {ComponentType} from 'react';
import {ColorValue} from 'react-native';

import {CredentialStatusEnum, IssuerStatusEnum} from '../credential';

export enum ButtonIconsEnum {
  BACK = 'back',
  MORE = 'more',
  CLOSE = 'close',
}

export enum MoreMenuIconsEnum {
  ADD = 'add',
  DELETE = 'delete',
}

export enum PopupImagesEnum {
  SECURITY = 'security',
  WARNING = 'warning',
}

export enum PopupBadgesEnum {
  CHECK_MARK = 'checkMark',
  EXCLAMATION_MARK = 'exclamationMark',
}

export interface IHeaderProps {
  showBorder: boolean;
}

export interface IButton {
  caption: string;
  onPress: () => Promise<void>;
  disabled?: boolean;
}

export interface IMoreMenuButton extends IButton {
  icon?: MoreMenuIconsEnum;
  fontColor?: ColorValue;
}

export type LabelStatus = CredentialStatusEnum | IssuerStatusEnum;

export interface ITabRoute {
  key: string;
  title: string;
}

export interface ITabViewRoute extends ITabRoute {
  content: ComponentType<unknown>;
}
