import {Animated} from 'react-native';
import styled from 'styled-components/native';

import {SSITextH0LightStyled} from '../../fonts';
import {SSILinearGradientStyled} from '../../gradients';

export const SSIPinCodeSegmentUnderlineAnimatedStyled = styled(Animated.View)`
  width: 44px;
  height: 2px;
`;

export const SSIPinCodeSegmentTextContainerStyled = styled.View`
  width: 44px;
  height: 48px;
  margin-top: auto;
  margin-bottom: 2px;
`;

export const SSIPinCodeSegmentTextStyled = styled(SSITextH0LightStyled)`
  text-align: center;
`;

export const SSIPinCodeSegmentUnderlineLinearGradientStyled = styled(SSILinearGradientStyled)`
  width: 44px;
  height: 2px;
`;
