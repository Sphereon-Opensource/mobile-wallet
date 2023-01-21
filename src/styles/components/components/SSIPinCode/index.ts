import { Animated } from 'react-native'
import styled from 'styled-components/native'

import { fonts, statuses } from '../../../colors'
import { SSITextH4LightStyled } from '../../fonts'

export const SSIPinCodeContainerAnimatedStyled = styled(Animated.View)`
  width: 244px;
  height: 52px;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 17px;
`

export const SSIPinCodeErrorMessageTextStyled = styled(SSITextH4LightStyled)`
  text-align: center;
  font-size: 11px;
  color: ${statuses.error};
  margin-bottom: 5px;
`

export const SSIPinCodeAttemptsLeftTextStyled = styled(SSITextH4LightStyled)`
  text-align: center;
  font-size: 11px;
  color: ${fonts.light};
`
