import styled from 'styled-components/native'

import { backgrounds } from '../../../colors'

// TODO we should already have this as a general container for secondary dark color
export const SSICredentialDetailsViewContainerStyled = styled.View`
  background-color: ${backgrounds.tabViewDark};
`

export const SSICredentialDetailsViewFooterContainerStyled = styled.View`
  width: 100%;
  height: 39px;
  margin-bottom: 8px;
  margin-top: 18px;
  padding-left: 24px;
  padding-right: 24px;
`

// TODO get text elements
export const SSICredentialDetailsViewFooterLabelCaptionStyled = styled.Text`
  margin-top: 2px;
  margin-left: auto;
  font-size: 10px;
  line-height: 15px;
  font-weight: 400;
  color: #FBFBFB;
`

// TODO get text elements
export const SSICredentialDetailsViewFooterLabelValueStyled = styled.Text`
  margin-left: auto;
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
  color: #FBFBFB;
`
