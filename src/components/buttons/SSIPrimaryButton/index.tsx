import React, { FC } from 'react'
import { PressableProps, ViewStyle } from 'react-native'

import { OpacityStyleEnum } from '../../../@types'
import {
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSITextH2LightStyled as ButtonCaption,
  SSIRoundedCenteredLinearGradientStyled as LinearGradient,
} from '../../../styles/components'

export interface Props extends PressableProps {
  title: string // TODO rename to caption
  disabled?: boolean | undefined
  onPress?: () => void
  style?: ViewStyle
}

const SSIPrimaryButton: FC<Props> = (props: Props): JSX.Element => {
  return (
    <Button
      onPress={props.onPress}
      disabled={props.disabled}
      style={{
        opacity: props.disabled ? OpacityStyleEnum.DISABLED : OpacityStyleEnum.ACTIVE
      }}
    >
      <LinearGradient style={{ ...props.style }}>
        <ButtonCaption>{props.title}</ButtonCaption>
      </LinearGradient>
    </Button>
  )
}

export default SSIPrimaryButton
