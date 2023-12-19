import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import {SSITextH3AnimatedLightStyled} from '../../fonts';
import {SSILinearGradientStyled} from '../../gradients';
import {borderColors} from '@sphereon/ui-components.core';

export const SSITabViewHeaderContainerStyled = styled.View`
  flex-direction: row;
  border-bottom-color: ${borderColors.dark};
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
