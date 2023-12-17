import styled from 'styled-components/native';
import {SSIBasicContainerStyled} from '../../containers';
import {backgroundColors} from '@sphereon/ui-components.core';

export const SSIWelcomeScreenContainerStyled = styled(SSIBasicContainerStyled)`
  overflow: hidden;
`;

export const SSIWelcomeScreenWelcomeViewContainerStyled = styled.View`
  margin-top: auto;
`;

export const SSIWelcomeScreenIntroBackgroundContainerStyled = styled.View`
  background-color: ${backgroundColors.primaryDark};
  position: absolute;
  z-index: -1;
  width: 500px;
  height: 915px;
  left: 50%;
  margin-left: -250px;
  top: 50%;
  margin-top: -457.5px;
`;
