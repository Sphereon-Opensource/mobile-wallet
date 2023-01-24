import styled from 'styled-components/native'

import { backgrounds } from '../../../colors'
import { SSIBasicContainerStyled } from '../../containers'

export const SSIOnboardingWelcomeIntroScreenContainerStyled = styled(SSIBasicContainerStyled)`
  overflow: hidden;
`

export const SSIOnboardingWelcomeIntroScreenWelcomeViewContainerStyled = styled.View`
  margin-top: auto;
`

export const SSIOnboardingWelcomeIntroScreenBackgroundContainerStyled = styled.View`
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
