import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSIBackgroundPrimaryDarkColorCss} from '../../css';
import {backgroundColors, borderColors} from '@sphereon/ui-components.core';

export const SSINavigationBarButtonStyled = styled(TouchableOpacity)`
  flex: 1;
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
