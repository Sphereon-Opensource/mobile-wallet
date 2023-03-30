import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import {borders} from '../../../colors';
import {SSITextH3AnimatedLightStyled} from '../../fonts';
import {SSILinearGradientStyled} from '../../gradients';

export const SSITabViewHeaderContainerStyled = styled.View`
  flex-direction: row;
  border-bottom-color: ${borders.dark};
  border-bottom-width: 1px;
`;

export const SSITabViewHeaderTabHeaderStyled = styled(TouchableOpacity)`
  flex: 1;
`;

export const SSITabViewHeaderTabHeaderCaptionStyled = styled(SSITextH3AnimatedLightStyled)`
  margin-bottom: 2px;
`;

export const SSITabViewHeaderTabIndicatorStyled = styled(SSILinearGradientStyled)`
  width: 92px;
  height: 2px;
`;
