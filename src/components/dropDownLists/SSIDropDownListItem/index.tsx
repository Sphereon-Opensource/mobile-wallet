import React, {FC} from 'react';
import {ColorValue, DeviceEventEmitter, View} from 'react-native';

import {borders, fonts} from '../../../styles/colors';
import {
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSIDropDownListItemContainerStyled as Container,
  SSIDropDownListItemIconContainerStyled as IconContainer,
  SSIDropDownListItemCaptionContainerStyled as ListItemCaption,
} from '../../../styles/components';
import {HeaderEventEnum, MoreMenuIconsEnum, OpacityStyleEnum} from '../../../types';
import SSIAddIcon from '../../assets/icons/SSIAddIcon';
import SSIDeleteIcon from '../../assets/icons/SSIDeleteIcon';

export interface IProps {
  caption: string;
  onPress: () => Promise<void>;
  disabled?: boolean;
  icon?: MoreMenuIconsEnum;
  showBorder?: boolean;
  fontColor?: ColorValue;
}

const SSIDropDownListItem: FC<IProps> = (props: IProps): JSX.Element => {
  const {disabled, caption, icon, showBorder = false, fontColor = fonts.dark} = props;

  const onPress = async () => {
    DeviceEventEmitter.emit(HeaderEventEnum.ON_MORE_MENU_CLOSE);
    await props.onPress();
  };

  const getIcon = (icon: MoreMenuIconsEnum): JSX.Element => {
    const {fontColor = fonts.dark} = props;

    switch (icon) {
      case MoreMenuIconsEnum.DELETE:
        return <SSIDeleteIcon color={fontColor} />;
      case MoreMenuIconsEnum.ADD:
        return <SSIAddIcon color={fontColor} />;
      default:
        return <View />;
    }
  };

  return (
    <Button
      onPress={onPress}
      disabled={disabled}
      style={{
        ...(disabled && {opacity: OpacityStyleEnum.DISABLED}),
      }}>
      <Container style={{...(showBorder && {borderBottomWidth: 2, borderBottomColor: borders.light})}}>
        <ListItemCaption style={{color: fontColor}}>{caption}</ListItemCaption>
        {icon && <IconContainer>{getIcon(icon)}</IconContainer>}
      </Container>
    </Button>
  );
};

export default SSIDropDownListItem;
