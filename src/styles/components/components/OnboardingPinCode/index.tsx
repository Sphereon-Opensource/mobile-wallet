import {fontColors, statusColors} from '@sphereon/ui-components.core';
import {Animated} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH4LightStyled} from '../../fonts';

export const OnboardingPinCodeContainerStyled = styled(Animated.View)`
  width: 100%;
`;

export const OnboardingPinCodeContainerAnimatedStyled = styled(Animated.View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 17px;
  gap: 10px;
`;

export const OnboardingPinCodeErrorMessageTextStyled = styled(SSITextH4LightStyled)`
  text-align: center;
  font-size: 11px;
  color: ${statusColors.error};
  margin-bottom: 5px;
`;

export const OnboardingPinCodeAttemptsLeftTextStyled = styled(SSITextH4LightStyled)`
  text-align: center;
  font-size: 11px;
  color: ${fontColors.light};
`;
