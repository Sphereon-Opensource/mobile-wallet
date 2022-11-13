import { Animated, TouchableOpacity } from 'react-native'
import styled from 'styled-components/native'

export const SSITabViewHeaderContainerStyled = styled.View`
  flex-direction: row;
`

export const SSITabViewHeaderTabHeaderStyled = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
`

// TODO this should be one of the fonts
export const SSITabViewHeaderTabHeaderCaptionStyled = styled(Animated.Text)`
  color: white;
  line-height: 21px;
  font-size: 14px;
  font-weight: 600;
`

// TODO move color
export const SSITabViewHeaderTabIndicatorStyled = styled.View`
  width: 92px;
  height: 2px;
  background-color: #7c40e8;
`
