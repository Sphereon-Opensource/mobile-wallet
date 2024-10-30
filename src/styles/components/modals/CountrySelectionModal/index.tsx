import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import styled from 'styled-components/native';
import SSIIconButton, {Props} from '../../../../components/buttons/SSIIconButton';
import {ButtonIconsEnum} from '../../../../types';
import {View} from 'react-native';

export const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px;
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

export const CloseIcon = ({...otherProps}: Omit<Props, 'icon'>) => (
  <SSIIconButton
    iconColor={fontColors.light}
    icon={ButtonIconsEnum.CLOSE}
    iconSize={15}
    style={{
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
    }}
    {...otherProps}
  />
);

export const ModalContentContainer = styled.View`
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 12px 24px 36px;
  background-color: ${backgroundColors.secondaryDark};
  flex: 1;
`;
