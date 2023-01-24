import styled from 'styled-components/native'

import { backgrounds, borders } from '../../../colors'
import { SSITextH1LightStyled } from '../../fonts'

export const SSIWelcomeViewContainerStyled = styled.View`
  border-top-width: 1px;
  border-top-color: ${borders.dark};
  background-color: ${backgrounds.primaryDark};
  width: 100%;
`

export const SSIWelcomeViewTitleTextStyled = styled(SSITextH1LightStyled)`
  margin-bottom: 6px;
`

export const SSIWelcomeViewContentContainerStyled = styled.View`
  margin: 0px 24px 34px 24px;
`

export const SSIWelcomeViewProgressIndicatorContainerStyled = styled.View`
  align-items: center;
  padding: 14px 0px 12px 0px;
`

export const SSIWelcomeViewButtonContainerStyled = styled.View`
  margin-bottom: 30px;
  align-items: center;
`
