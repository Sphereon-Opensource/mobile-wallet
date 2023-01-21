import styled from 'styled-components/native'

import { IHeaderProps } from '../../../../@types'
import EntityIcon from '../../../../assets/icons/entity.svg'
import SSIIconButton from '../../../../components/buttons/SSIIconButton'
import { borders } from '../../../colors'
import { SSIBackgroundPrimaryDarkColorCss } from '../../css'
import { SSITextH1LightStyled, SSITextH4LightStyled } from '../../fonts'

export const SSIHeaderBarContainerStyled = styled.View`
  ${SSIBackgroundPrimaryDarkColorCss};
  border-bottom-color: ${borders.dark};
  border-bottom-width: ${(props: IHeaderProps) => (props.showBorder ? '1px' : '0px')};
`

export const SSIHeaderBarHeaderSubCaptionStyled = styled(SSITextH4LightStyled)`
  margin-left: 24px;
  margin-bottom: 14px;
`

export const SSIHeaderBarHeaderCaptionStyled = styled(SSITextH1LightStyled)`
  margin-left: 24px;
`

export const SSIHeaderBarEntityIconStyled = styled(EntityIcon)`
  margin-left: auto;
  margin-right: 25px;
  margin-top: 7px;
`

export const SSIHeaderBarMoreIconStyled = styled(SSIIconButton)`
  margin-right: 25px;
  margin-top: 35px;
  margin-left: auto;
  margin-bottom: 14px;
`

export const SSIHeaderBarBackIconStyled = styled(SSIIconButton)`
  margin-top: 18px;
  margin-left: 24px;
`
