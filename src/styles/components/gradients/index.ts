import { LinearGradient } from 'expo-linear-gradient'
import styled from 'styled-components/native'

import { highLightGradients } from '../../colors'
import { SSIRoundedEdgesCss } from '../css'

export const SSILinearGradientStyled = styled(LinearGradient).attrs({
  colors: [highLightGradients['100'].secondaryColor, highLightGradients['100'].primaryColor],
  start: { x: 1, y: 1 },
  end: { x: 0, y: 0 }
})``

export const SSILinearGradientSecondaryStyled = styled(LinearGradient).attrs({
  colors: [highLightGradients['200'].secondaryColor, highLightGradients['200'].primaryColor],
  start: { x: 1, y: 1 },
  end: { x: 0, y: 0 }
})``

export const SSIRoundedLinearGradient = styled(SSILinearGradientStyled)`
  ${SSIRoundedEdgesCss}
`
