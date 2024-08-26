import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import styled from 'styled-components/native';
import SSIIconButton from '../../../../components/buttons/SSIIconButton';
import {ButtonIconsEnum} from '../../../../types';

export const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px;
`;

export const Flag = styled.Image`
  width: 17px;
  height: 12px;
  margin-right: 10px;
`;

export const Circle = styled.View`
  margin-left: auto;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border-width: 2px;
  border-color: ${backgroundColors.primaryLight};
  position: relative;
`;

export const SelectedCircle = styled.View`
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  border-radius: 5px;
  background-color: #0b81ff;
`;

export const CloseIcon = styled(SSIIconButton).attrs({
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

export const ModalContentContainer = styled.View`
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 12px 24px 36px;
  background-color: ${backgroundColors.secondaryDark};
  flex: 1;
`;
