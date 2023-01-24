import { TextInput } from 'react-native'
import styled from 'styled-components/native'

import { fonts, inputs } from '../../colors'
import { fontStyle } from '../../typography'

export const TextInputStyled = styled(TextInput).attrs({
  placeholderTextColor: inputs.placeholder
})`
  font-family: ${fontStyle.h3Regular.fontFamily};
  font-size: ${fontStyle.h3Regular.fontSize}px;
  font-weight: ${fontStyle.h3Regular.fontWeight};
  line-height: ${fontStyle.h3Regular.lineHeight}px;
  color: ${fonts.light};
`
