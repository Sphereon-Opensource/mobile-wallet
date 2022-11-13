import React, { FC } from 'react'
import { Animated } from 'react-native'

import { ITabRoute } from '../../../../@types'
import {
  SSITabViewHeaderContainerStyled as Container,
  SSITabViewHeaderTabHeaderStyled as Header,
  SSITabViewHeaderTabHeaderCaptionStyled as HeaderCaption,
  SSITabViewHeaderTabIndicatorStyled as HeaderIndicator
} from '../../../../styles/components'

const { v4: uuidv4 } = require('uuid')

export interface IProps {
  navigationState: { index: number; routes: Array<ITabRoute> }
  position: Animated.AnimatedInterpolation
  onIndexChange: (index: number) => void
}

const SSITabViewHeader: FC<IProps> = (props: IProps): JSX.Element => {
  const { navigationState, position, onIndexChange } = props

  const inputRange = navigationState.routes.map((route: ITabRoute, index: number) => index)

  return (
    <Container>
      {navigationState.routes.map((route: ITabRoute, i: number) => {
        const opacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map((index: number) => (index === i ? 1 : 0.5))
        })

        return (
          <Header key={uuidv4()} onPress={() => onIndexChange(i)}>
            <HeaderCaption style={{ opacity }}>{route.title}</HeaderCaption>
            {navigationState.index === i ? <HeaderIndicator /> : null}
          </Header>
        )
      })}
    </Container>
  )
}

export default SSITabViewHeader
