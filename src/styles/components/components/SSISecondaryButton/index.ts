import styled from 'styled-components/native'

import { backgrounds } from '../../../colors'
import { SSIRoundedCenteredLinearGradientStyled } from '../../buttons'
import { SSIRoundedContainerStyled } from '../../containers'

export const SSISecondaryButtonContainerStyled = styled(SSIRoundedContainerStyled)`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background-color: ${backgrounds.primaryDark};
`

export const SSIRoundedCenteredLinearGradientSecondaryButtonStyled = styled(SSIRoundedCenteredLinearGradientStyled)`
  padding: 1.2px;
`
