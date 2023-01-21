import styled from 'styled-components/native'
import { SSIFlexDirectionRowViewStyled } from '../../containers'
import { SSITextH5LightStyled } from '../../fonts'

export const SSIStatusLabelContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  border-radius: 9px;
  border-width: 1px;
`

export const SSIStatusLabelStatusCaptionStyled = styled(SSITextH5LightStyled)`
  margin-left: 7px;
  margin-right: 7px;
`

export const SSIStatusLabelBadgeContainer = styled.View`
  margin-top: auto;
  margin-bottom: auto;
`
