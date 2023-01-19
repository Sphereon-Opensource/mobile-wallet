import { TextInput } from 'react-native'
import { LinearTextGradient } from 'react-native-text-gradient'
import styled from 'styled-components/native'

import { highLightGradients } from '../../../colors'
import { SSILinearGradientStyled } from '../../../styledComponents'
import { fontStyle } from '../../../typography'

export const SSITextInputFieldContainerStyled = styled.View`
  width: 100%;
`

export const SSITextInputFieldLinearTextGradientStyled = styled(LinearTextGradient).attrs({
  locations: [0, 1],
  colors: [highLightGradients['100'].secondaryColor, highLightGradients['100'].primaryColor],
  start: { x: 1, y: 1 },
  end: { x: 0, y: 0 }
})``

// TODO move after merging styles refactor
export const TextInputStyled = styled(TextInput).attrs({
  placeholderTextColor: 'grey' //TODO
})`
  font-family: ${fontStyle.h3Regular.fontFamily};
  font-size: ${fontStyle.h3Regular.fontSize}px;
  font-weight: ${fontStyle.h3Regular.fontWeight};
  line-height: ${fontStyle.h3Regular.lineHeight}px;
  color: #FFFFFF;
`

export const SSITextInputFieldTextInputStyled = styled(TextInputStyled)`
  flex: 1;
`

export const SSITextInputFieldIconContainerStyled = styled.View`
  margin-left: auto;
  padding-left: 15px;
  justify-content: center;
`

export const SSITextInputFieldUnderlineStyled = styled.View`
  width: 100%;
  margin-bottom: 4px;
`

export const SSITextInputFieldUnderlineLinearGradientStyled = styled(SSILinearGradientStyled)`
  height: 1px;
  width: 100%;
  margin-bottom: 4px;
`
