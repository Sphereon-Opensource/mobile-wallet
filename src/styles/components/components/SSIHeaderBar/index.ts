import { TouchableOpacity } from 'react-native'
import styled from 'styled-components/native'

import SSIIconButton from '../../../../components/buttons/SSIIconButton'
import { IHeaderProps } from '../../../../types'
import { borders } from '../../../colors'
import { SSIBackgroundPrimaryDarkColorCss } from '../../css'
import { SSITextH1LightStyled, SSITextH4LightStyled } from '../../fonts'

export const SSIHeaderBarContainerStyled = styled.View`
  ${SSIBackgroundPrimaryDarkColorCss};
  border-bottom-color: ${borders.dark};
  border-bottom-width: ${(props: IHeaderProps) => (props.showBorder ? '1px' : '0px')};
`

export const SSIHeaderBarHeaderSubCaptionStyled = styled(SSITextH4LightStyled)`
  margin: 0px 24px 14px 24px;
`

export const SSIHeaderBarHeaderCaptionStyled = styled(SSITextH1LightStyled)`
  margin-left: 24px;
`

export const SSIHeaderBarEntityIconContainerStyled = styled(TouchableOpacity)`
  margin: 7px 25px 0px auto;
`

export const SSIHeaderBarMoreIconStyled = styled(SSIIconButton)`
  margin: 35px 25px 14px auto;
`

export const SSIHeaderBarBackIconStyled = styled(SSIIconButton)`
  margin: 18px 0px 0px 24px;
`
