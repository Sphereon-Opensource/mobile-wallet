import styled from 'styled-components/native'

import {
  SSIFlexDirectionRowViewStyled,
  SSITextH7SemiBoldLightStyled
} from '../../../styledComponents';

export const SSITextFieldContainerStyled = styled.View`
  width: 100%;
  padding-top: 2px;
  padding-right: 24px;
  padding-bottom: 4px;
`

export const SSITextFieldHeaderContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  padding-left: 24px;
`

export const SSITextFieldStatusLabelContainerStyled = styled.View`
  width: 24px;
`

export const SSITextFieldEditBadgeContainerStyled = styled.View`
  margin-top: 3px;
  margin-bottom: auto;
  margin-left: auto;
  margin-right: auto;
`

export const SSITextFieldContentBadgeContainerStyled = styled.View`
  width: 24px;
`

export const SSITextFieldContentTextStyled = styled(SSITextH7SemiBoldLightStyled)`
  margin-right: 24px;
`
