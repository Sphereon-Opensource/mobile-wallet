import styled from 'styled-components/native';
import Animated from 'react-native-reanimated';
import {fontColors} from '@sphereon/ui-components.core';
import SSIIconButton from '../../../../components/buttons/SSIIconButton';
import {ButtonIconsEnum} from '../../../../types';

export const AusweisModalButtonContainerStyled = styled.View`
  gap: 12px;
`;

export const AusweisModalIconButtonStyled = styled(SSIIconButton).attrs({
  // FIXME while using this styled component it is complaining about required properties not being present even if we set it here
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
