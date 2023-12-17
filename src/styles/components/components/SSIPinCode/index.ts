import {Animated} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH4LightStyled} from '../../fonts';
import {fontColors, statusColors} from '@sphereon/ui-components.core';

export const SSIPinCodeContainerStyled = styled(Animated.View)`
  width: 100%;
  align-items: center;
`;

export const SSIPinCodeContainerAnimatedStyled = styled(Animated.View)`
  height: 52px;
  flex-direction: row;
  margin-bottom: 17px;
`;

export const SSIPinCodeErrorMessageTextStyled = styled(SSITextH4LightStyled)`
  text-align: center;
  font-size: 11px;
  color: ${statusColors.error};
  margin-bottom: 5px;
`;

export const SSIPinCodeAttemptsLeftTextStyled = styled(SSITextH4LightStyled)`
  text-align: center;
  font-size: 11px;
  color: ${fontColors.light};
`;
