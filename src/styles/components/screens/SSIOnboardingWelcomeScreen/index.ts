import styled from 'styled-components/native'

import { backgrounds } from '../../../colors'
import { SSIBasicContainerStyled } from '../../containers'
import { SSILinearGradientWelcomeStyled } from '../../gradients'

export const SSIOnboardingWelcomeScreenContainerStyled = styled(SSIBasicContainerStyled)`
  overflow: hidden;
`

export const SSIOnboardingWelcomeScreenWelcomeViewContainerStyled = styled.View`
  margin-top: auto;
`

export const SSIOnboardingWelcomeScreenIntroBackgroundContainerStyled = styled.View`
  background-color: ${backgrounds.primaryDark};
  position: absolute;
  z-index: -1;
  width: 500px;
  height: 915px;
  left: 50%;
  margin-left: -250px;
  top: 50%;
  margin-top: -457.5px;
`

export const SSIOnboardingWelcomeScreenBackgroundContainerStyled = styled(SSILinearGradientWelcomeStyled)`
  flex: 1;
  align-items: center;
`
