import styled from 'styled-components/native'

import { backgrounds, borders } from '../../../colors'
import { SSITextH1LightStyled, SSITextH2LightStyled } from '../../fonts'

export const SSIWelcomeViewContainerStyled = styled.View`
  border-top-width: 1px;
  border-top-color: ${borders.dark};
  background-color: ${backgrounds.primaryDark};
  width: 100%;
`

export const SSIWelcomeViewHeaderTextStyled = styled(SSITextH2LightStyled)`
  margin-bottom: 4px;
`

export const SSIWelcomeViewTitleTextStyled = styled(SSITextH1LightStyled)`
  margin-bottom: 6px;
`

export const SSIWelcomeViewContentContainerStyled = styled.View`
  margin: 0px 24px 14px 24px;
`

export const SSIWelcomeViewBodyContainerStyled = styled.View`
  min-height: 170px;
`

export const SSIWelcomeViewProgressIndicatorContainerStyled = styled.View`
  align-items: center;
  padding: 14px 0px 12px 0px;
`

export const SSIWelcomeViewButtonContainerStyled = styled.View`
  margin-bottom: 36px;
  align-items: center;
`
