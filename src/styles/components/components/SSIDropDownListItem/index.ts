import styled from 'styled-components/native'

import { backgrounds } from '../../../colors'
import { SSIFlexDirectionRowViewStyled } from '../../containers'
import { SSITextH2Styled } from '../../fonts'

export const SSIDropDownListItemContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  flex: 1;
  background-color: ${backgrounds.primaryLight};
`

export const SSIDropDownListItemCaptionContainerStyled = styled(SSITextH2Styled)`
  margin: 13px 0px 11px 16px;
`

export const SSIDropDownListItemIconContainerStyled = styled.View`
  width: 42px;
  margin: 4px 6px 2px auto;
  align-items: center;
  justify-content: center;
`
