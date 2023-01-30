import styled from 'styled-components/native'

import SSIStatusLabel from '../../../../components/labels/SSIStatusLabel'
import { SSIFlexDirectionRowViewStyled, SSIRoundedContainerStyled } from '../../containers'
import { SSITextH4SemiBoldLightStyled, SSITextH5LightStyled } from '../../fonts'

export const SSICardViewContainerStyled = styled(SSIRoundedContainerStyled)`
  width: 327px;
  height: 186px;
`

export const SSICardViewHeaderContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  height: 32px;
  margin-top: 16px;
`

export const SSICardViewHeaderLogoContainerStyled = styled.View`
  margin-left: 9px;
  width: 100%;
  max-width: 64px;
`

export const SSICardViewHeaderTitleContainerStyled = styled.View`
  margin: 0px 13px 0px auto;
`

export const SSICardViewContentMainContainerStyled = styled.View`
  flex: 1;
`

export const SSICardViewContentSubContainerStyled = styled.View`
  margin-top: auto;
`

export const SSICardViewContentIssueNameContainerStyled = styled.View`
  padding: 2px 9px 2px 12px;
`

export const SSICardViewContentPropertiesContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  justify-content: flex-start;
  margin: 1px 0px 1px 0px;
  padding: 2px 9px 4px 12px;
`

// Padding hacking to fix an issue with BlurView that messes up the positions on load doing it the normal way
// background-color: transparent, needs to be added or the positions are getting messed up
export const SSICardViewFooterContentContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  padding: 11px 11px 11px 12px;
  background-color: transparent;
`

// overflow: 'hidden' added to stop the BlurView from expanding
export const SSICardViewFooterContainerStyled = styled.View`
  height: 39px;
  margin-top: auto;
  overflow: hidden;
`

export const SSICardViewCredentialTitleTextStyled = styled(SSITextH4SemiBoldLightStyled)`
  text-align: right;
`

export const SSICardViewCredentialSubtitleTextStyled = styled(SSITextH5LightStyled)`
  text-align: right;
`

export const SSICardViewSSICredentialStatusStyled = styled(SSIStatusLabel)`
  margin-left: auto;
`
