import styled from 'styled-components/native'

import SSIPlaceholderLogo from '../../../../components/assets/images/SSIPlaceholderLogo'
import {
  SSIFlexDirectionRowViewStyled,
  SSITextH5LightStyled
} from '../../../styledComponents'

export const SSIContactViewItemContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  padding: 16px 24px 18px 7px;
`

export const SSIContactViewItemNewStatusContainerStyled = styled.View`
  height: 10px;
  width: 17px;
  margin: auto 0 auto 0;
`

export const SSIContactViewItemLogoContainerStyled = styled.View`
  width: 78px;
  margin: 2.5px 4px 2.5px 0px;
  align-items: center;
  justify-content: center;
`

export const SSIContactViewItemTextContainerStyled = styled.View`
  flex: 1;
`

export const SSIContactViewItemContactDetailsContainerStyled = styled.View`
  flex: 1;
  margin-bottom: 6px;
`

export const SSIContactViewItemContactRoleContainerStyled = styled.View`
  flex: 1;
`

export const SSIContactViewItemContactRoleCaptionStyled = styled(SSITextH5LightStyled)`
  opacity: 0.8;
`

export const SSIContactViewItemPlaceholderLogoStyled = styled(SSIPlaceholderLogo).attrs({
  size: 26
})``
