import styled from 'styled-components/native'

import SSICheckmarkBadge from '../../../../components/badges/SSICheckmarkBadge'
import SSIExclamationMarkBadge from '../../../../components/badges/SSIExclamationMarkBadge'
import { buttons, fonts } from '../../../colors'
import {
  SSIFlexDirectionRowViewStyled,
  SSIRoundedContainerBackgroundPrimaryLightStyled,
  SSITextH4SemiBoldStyled,
  SSITextH5Styled
} from '../../../styledComponents'

export const SSIPopupContainerStyled = styled(SSIRoundedContainerBackgroundPrimaryLightStyled)`
  width: 100%;
`

export const SSIPopupHeaderContainerStyled = styled.View`
  height: 18px;
  padding-right: 12.5px;
`

export const SSIPopupImageContainerStyled = styled.View`
  padding-top: 21px;
  padding-bottom: 21px;
  align-items: center;
`

export const SSIPopupContentContainerStyled = styled.View`
  padding-left: 18px;
  padding-right: 18px;
`

export const SSIPopupTitleContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 12px;
`

export const SSIPopupTitleBadgeContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  width: 22px;
  margin-top: auto;
  margin-bottom: auto;
`

export const SSIPopupDetailsButtonContainerStyled = styled.View`
  margin-bottom: 16px;
`

export const SSIPopupDetailsTextStyled = styled(SSITextH5Styled)`
  margin-bottom: 16px;
  flex-wrap: wrap;
`

export const SSIPopupExtraDetailsTextStyled = styled(SSITextH5Styled)`
  margin-bottom: 16px;
  flex-wrap: wrap;
  color: ${fonts.greyedOut};
`

export const SSIPopupDetailsButtonTextStyled = styled(SSITextH4SemiBoldStyled)`
  flex-wrap: wrap;
  color: ${buttons.blue};
`

export const SSIPopupCloseButtonContainerStyled = styled.View`
  margin-left: auto;
  margin-top: auto;
`

export const SSIPopupButtonsContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  justify-content: space-between;
  margin-bottom: 16px;
  padding-left: 18px;
  padding-right: 18px;
`

export const SSICheckmarkBadgeStyled = styled(SSICheckmarkBadge).attrs({
  size: 12
})``

export const SSIExclamationMarkBadgeStyled = styled(SSIExclamationMarkBadge).attrs({
  size: 12
})``
