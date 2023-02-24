import React, { FC } from 'react'
import { PressableProps, ViewStyle } from 'react-native'

import { backgrounds } from '../../../styles/colors'
import {
  SSIRoundedContainerBackgroundSecondaryDarkStyled as Background,
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSITextH2SecondaryButtonStyled as ButtonCaption,
  SSISecondaryButtonContainerStyled as ButtonContainer,
  SSIRoundedCenteredLinearGradientSecondaryButtonStyled as LinearGradient
} from '../../../styles/components'
import { OpacityStyleEnum } from '../../../types'

export interface Props extends PressableProps {
  title: string // TODO rename to caption
  disabled?: boolean | undefined
  onPress?: () => void
  style?: ViewStyle
}

const SSISecondaryButton: FC<Props> = (props: Props): JSX.Element => {
  const { onPress, disabled, style } = props

  return (
    <Background>
      <Button
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.5}
        style={{
          opacity: disabled ? OpacityStyleEnum.DISABLED : OpacityStyleEnum.ACTIVE
        }}
      >
        <LinearGradient style={{ ...props.style }}>
          <ButtonContainer
            style={{ backgroundColor: style?.backgroundColor ? style?.backgroundColor : backgrounds.primaryDark }}
          >
            <ButtonCaption>{props.title}</ButtonCaption>
          </ButtonContainer>
        </LinearGradient>
      </Button>
    </Background>
  )
}

export default SSISecondaryButton
