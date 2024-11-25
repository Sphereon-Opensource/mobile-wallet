import {borderColors, fontColors} from '@sphereon/ui-components.core';
import React, {useCallback, useEffect, useRef} from 'react';
import {ColorValue, TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';
import {useAccessibility} from '../../hooks/useAccessibility';
import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIDropDownListContainerStyled as Container,
  SSITextH2Styled,
  SSITextH3LightStyled,
  SSITextH4Styled,
} from '../../styles/components';
import {ButtonIconsEnum, HeaderMenuIconsEnum, IHeaderMenuButton} from '../../types';
import SSIAddIcon from '../assets/icons/SSIAddIcon';
import SSIDeleteIcon from '../assets/icons/SSIDeleteIcon';
import SSIDownloadIcon from '../assets/icons/SSIDownloadIcon';
import SSILogoutIcon from '../assets/icons/SSILogoutIcon';
import SSIQRIcon from '../assets/icons/SSIQRIcon';
import SettingsIcon from '../assets/icons/SettingsIcon';
import {Props as IconButtonProps} from '../buttons/SSIIconButton';

export const Back = (props: Omit<IconButtonProps, 'icon'>) => (
  <BackIcon
    style={{
      width: 36,
      height: 42,
      marginTop: 0,
      justifyContent: 'center',
    }}
    icon={ButtonIconsEnum.BACK}
    accessibilityLabel="Go back"
    {...props}
  />
);

export const Title = styled(SSITextH3LightStyled).attrs({accessibilityRole: 'header'})``;

export const Subtitle = styled(SSITextH4Styled)`
  color: ${fontColors.greyedOut};
`;

type CenterInfoProps = {
  title: string;
  subtitle?: string;
  titleAccessibilityLabel?: string;
  subtitleAccessibilityLabel?: string;
};
export const CenterInfo = ({title, subtitle, titleAccessibilityLabel, subtitleAccessibilityLabel}: CenterInfoProps) => (
  <View style={{alignItems: 'center'}}>
    <Title accessibilityLabel={titleAccessibilityLabel}>{title}</Title>
    {subtitle && <Subtitle accessibilityLabel={subtitleAccessibilityLabel}>{subtitle}</Subtitle>}
  </View>
);

export type AccessibleMenuProps = {
  items: IHeaderMenuButton[];
};

const renderIcon = (icon: HeaderMenuIconsEnum, fontColor: ColorValue = fontColors.dark): JSX.Element => {
  switch (icon) {
    case HeaderMenuIconsEnum.DELETE:
      return <SSIDeleteIcon color={fontColor} />;
    case HeaderMenuIconsEnum.ADD:
      return <SSIAddIcon color={fontColor} />;
    case HeaderMenuIconsEnum.LOGOUT:
      return <SSILogoutIcon color={fontColor} />;
    case HeaderMenuIconsEnum.DOWNLOAD:
      return <SSIDownloadIcon color={fontColor} />;
    case HeaderMenuIconsEnum.SETTINGS:
      return <SettingsIcon color={fontColor} />;
    case HeaderMenuIconsEnum.QR:
      return <SSIQRIcon primaryColor={fontColor} secondaryColor={fontColor} />;
    default:
      return <View />;
  }
};

export const AccessibleMenu = ({items}: AccessibleMenuProps) => {
  const {setFocus} = useAccessibility();
  const firstMenuItemRef = useRef(null);
  const focusOnFirstMenuItem = useCallback(() => setFocus(firstMenuItemRef), [firstMenuItemRef]);
  useEffect(focusOnFirstMenuItem, []);
  return (
    <Container style={{marginLeft: 'auto'}} accessibilityRole="menu">
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.caption}
          ref={index === 0 ? firstMenuItemRef : null}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 16,
            ...(index !== 0 && {borderTopWidth: 2, borderTopColor: borderColors.light}),
          }}
          accessible
          accessibilityRole="menuitem"
          accessibilityLabel={item.caption}
          accessibilityHint={`${index === items.length - 1 ? (items.length === 1 ? 'Only menu item.' : 'Last menu item.') : ''} ${
            item.accessibilityHint
          }`}
          onPress={item.onPress}>
          <SSITextH2Styled style={{color: item.fontColor}}>{item.caption}</SSITextH2Styled>
          {item.icon && renderIcon(item.icon)}
        </TouchableOpacity>
      ))}
    </Container>
  );
};
