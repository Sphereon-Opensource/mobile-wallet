import {Animated} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH0LightStyled} from '../../fonts';
import {SSILinearGradientStyled} from '../../gradients';

export const OnboardingPinCodeSegmentUnderlineAnimatedStyled = styled(Animated.View)`
  height: 2px;
`;

export const OnboardingPinCodeSegmentTextContainerStyled = styled.View`
  height: 48px;
  margin-top: auto;
  margin-bottom: 2px;
`;

export const OnboardingPinCodeSegmentTextStyled = styled(SSITextH0LightStyled)`
  text-align: center;
`;

export const OnboardingPinCodeSegmentUnderlineLinearGradientStyled = styled(SSILinearGradientStyled)`
  height: 2px;
`;
