import styled from 'styled-components/native';
import Animated from 'react-native-reanimated';
import React from 'react';
import {fontColors} from '@sphereon/ui-components.core';
import SSIIconButton, {Props as SSIIconButtonProps} from '../../../../components/buttons/SSIIconButton';
import {ButtonIconsEnum} from '../../../../types';

export const AusweisModalButtonContainerStyled = styled.View`
  gap: 12px;
`;

// Cast to make icon optional since it's provided via attrs
const SSIIconButtonWithOptionalIcon = SSIIconButton as React.ComponentType<Omit<SSIIconButtonProps, 'icon'> & {icon?: SSIIconButtonProps['icon']}>;

export const AusweisModalIconButtonStyled = styled(SSIIconButtonWithOptionalIcon).attrs({
  iconColor: fontColors.light,
  icon: ButtonIconsEnum.CLOSE,
  iconSize: 15,
})`
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
  margin-left: auto;
`;

export const AusweisModalAnimatedViewStyled = styled(Animated.View)`
  gap: 25px;
  margin-top: auto;
  background-color: #2c334b;
  border-top-right-radius: 32px;
  border-top-left-radius: 32px;
  padding: 12px 24px 36px 24px;
`;
