import {ImageAttributes} from '@sphereon/ui-components.core';
import {TCountryCode} from 'countries-list';
import {ComponentType} from 'react';
import {ColorValue} from 'react-native';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';

export enum ButtonIconsEnum {
  BACK = 'back',
  MORE = 'more',
  CLOSE = 'close',
  SEARCH = 'search',
  CHEVRON = 'chevron',
}

export enum HeaderMenuIconsEnum {
  ADD = 'add',
  DELETE = 'delete',
  LOGOUT = 'logout',
  DOWNLOAD = 'download',
  SETTINGS = 'settings',
  QR = 'qr',
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
  onPress: (() => Promise<void>) | (() => void);
  disabled?: boolean | (() => boolean);
  accessibilityLabel?: string;
}

export interface IHeaderMenuButton extends IButton {
  icon?: HeaderMenuIconsEnum;
  fontColor?: ColorValue;
  accessibilityHint?: string;
}

export interface ITabRoute {
  key: string;
  title: string;
}

export interface ITabViewRoute extends ITabRoute {
  content: ComponentType<unknown>;
}

export type CredentialMiniCardDisplay = {
  backgroundColor?: ColorValue;
  backgroundImage?: ImageAttributes;
  logoColor: ColorValue;
  logo?: ImageAttributes;
};

export type StepState = 'current' | 'finished' | 'upcoming';

export type StepContent = {
  render: (stepState: StepState) => JSX.Element;
  accessibility?: {
    getLabel: (stepState: StepState, current: number, isFinal: boolean) => string;
    buttonHint: string;
  };
};

export interface IStepIndicatorProps {
  state: StepState;
  isLastStep: boolean;
  stepIndex: number;
  ringColor: ColorValue;
}

export type CountryOption = {
  label: string;
  countryCode: TCountryCode;
  flag?: string;
  selected: boolean;
};

export type getCardElementArgs = {
  credential: CredentialSummary;
  index: number;
};
