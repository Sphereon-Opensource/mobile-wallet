import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import {backgroundColors, borderColors} from '@sphereon/ui-components.core';
import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSIBackgroundPrimaryDarkColorCss} from '../../css';

export const SSINavigationBarButtonStyled = styled(TouchableOpacity)`
  flex: 1;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

export const SSINavigationBarContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  align-items: center;
  height: 53px;
  ${SSIBackgroundPrimaryDarkColorCss};
  border-top-color: ${borderColors.dark};
  border-top-width: 1px;
`;

export const SSINavigationBarSafeAreaContainerStyled = styled.View`
  background-color: ${backgroundColors.primaryDark};
`;
