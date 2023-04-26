import {TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';

import {backgrounds, borders} from '../../../colors';
import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSIBackgroundPrimaryDarkColorCss} from '../../css';

export const SSINavigationBarButtonStyled = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
`;

export const SSINavigationBarContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  align-items: center;
  height: 53px;
  ${SSIBackgroundPrimaryDarkColorCss};
  border-top-color: ${borders.dark};
  border-top-width: 1px;
`;

export const SSINavigationBarSafeAreaContainerStyled = styled.View`
  background-color: ${backgrounds.primaryDark}
`;
