import styled from 'styled-components/native'

import {
  SSIBasicContainerStyled, SSIBasicHorizontalCenterContainerStyled,
  SSIFlexDirectionRowViewStyled,
  SSITextH4LightStyled
} from '../../../styledComponents'

export const SSIContactAddScreenContainerStyled = styled(SSIBasicHorizontalCenterContainerStyled)`
  padding-left: 24px;
  padding-right: 24px;
`

export const SSIContactAddScreenDisclaimerContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-top: 32px;
`

export const SSIContactAddScreenDisclaimerCheckboxContainerStyled = styled.View`
  margin-right: 10px;
`

export const SSIContactAddScreenDisclaimerCaptionStyled = styled(SSITextH4LightStyled)`
  flex: 1;
`
