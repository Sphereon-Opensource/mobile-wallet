import styled from 'styled-components/native'

import { SSIBasicHorizontalCenterContainerStyled, SSIFlexDirectionRowViewStyled } from '../../containers'
import { SSITextH4LightStyled } from '../../fonts'

export const SSIContactAddScreenContainerStyled = styled(SSIBasicHorizontalCenterContainerStyled)`
  padding-left: 24px;
  padding-right: 24px;
`

export const SSIContactAddScreenTextInputContainerStyled = styled.View`
  width: 100%;
  margin-top: 10px;
`

export const SSIContactAddScreenDisclaimerContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-top: 17px;
`

export const SSIContactAddScreenDisclaimerCheckboxContainerStyled = styled.View`
  margin-right: 10px;
`

export const SSIContactAddScreenDisclaimerCaptionStyled = styled(SSITextH4LightStyled)`
  flex: 1;
`
