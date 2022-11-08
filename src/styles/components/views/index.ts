import { BlurView } from '@react-native-community/blur'
import styled from 'styled-components/native'

export const SSIBlurredContainerStyled = styled(BlurView).attrs({
  blurType: 'light',
  blurAmount: 3
})`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.25);
`

export const SSIAlphaContainerStyled = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.2);
`
