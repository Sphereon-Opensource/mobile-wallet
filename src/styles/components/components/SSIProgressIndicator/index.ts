import styled from 'styled-components/native'

import { backgrounds } from '../../../colors'
import { SSILinearGradientSecondaryStyled } from '../../gradients'

export const SSIProgressIndicatorSegment = styled.View`
  border-radius: 3px;
  height: 4px;
  width: 34px;
  background-color: ${backgrounds.primaryLight}
`

export const SSIProgressIndicatorLinearGradientSegment = styled(SSILinearGradientSecondaryStyled)`
  border-radius: 3px;
  height: 4px;
  width: 34px;
`
