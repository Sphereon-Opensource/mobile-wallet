import React, {FC} from 'react';
import {ColorValue, View} from 'react-native';

import {borderColors, fontColors} from '@sphereon/ui-components.core';
import SSIQRIcon from '../../../components/assets/icons/SSIQRIcon';
import SettingsIcon from '../../../components/assets/icons/SettingsIcon';
import {
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSIDropDownListItemContainerStyled as Container,
  SSIDropDownListItemIconContainerStyled as IconContainer,
  SSIDropDownListItemCaptionContainerStyled as ListItemCaption,
} from '../../../styles/components';
import {HeaderMenuIconsEnum, OpacityStyleEnum} from '../../../types';
import SSIAddIcon from '../../assets/icons/SSIAddIcon';
import SSIDeleteIcon from '../../assets/icons/SSIDeleteIcon';
import SSIDownloadIcon from '../../assets/icons/SSIDownloadIcon';
import SSILogoutIcon from '../../assets/icons/SSILogoutIcon';

export interface IProps {
  caption: string;
  onPress: () => Promise<void>;
  disabled?: boolean;
  icon?: HeaderMenuIconsEnum;
  showBorder?: boolean;
  fontColor?: ColorValue;
}

const SSIDropDownListItem: FC<IProps> = (props: IProps): JSX.Element => {
  const {disabled, caption, icon, showBorder = false, fontColor = fontColors.dark} = props;
  const onPress = async () => {
    await props.onPress();
  };

  const getIcon = (icon: HeaderMenuIconsEnum): JSX.Element => {
    const {fontColor = fontColors.dark} = props;

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

  return (
    <Button
      accessibilityRole="menuitem"
      accessible
      onPress={onPress}
      disabled={disabled}
      style={{
        ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
      }}>
      <Container style={{...(showBorder && {borderBottomWidth: 2, borderBottomColor: borderColors.light})}}>
        <ListItemCaption style={{color: fontColor}}>{caption}</ListItemCaption>
        {icon && <IconContainer>{getIcon(icon)}</IconContainer>}
      </Container>
    </Button>
  );
};

export default SSIDropDownListItem;
