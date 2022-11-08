import React, { FC } from 'react'
import { PressableProps, ViewStyle } from 'react-native'

import { OpacityStyleEnum } from '../../../@types'
import { backgrounds } from '../../../styles/colors'
import {
  SSIRoundedContainerBackgroundSecondaryDarkStyled as Background,
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSITextH2SecondaryButtonStyled as ButtonCaption,
  SSIRoundedCenteredLinearGradientSecondaryButtonStyled as RoundedLinearGradient,
  SSIRoundedCenteredSecondaryButtonStyled as SecondaryButton
} from '../../../styles/styledComponents'

export interface Props extends PressableProps {
  title: string
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
        <RoundedLinearGradient style={{ ...props.style }}>
          <SecondaryButton
            style={{ backgroundColor: style?.backgroundColor ? style?.backgroundColor : backgrounds.primaryDark }}
          >
            <ButtonCaption>{props.title}</ButtonCaption>
          </SecondaryButton>
        </RoundedLinearGradient>
      </Button>
    </Background>
  )
}

export default SSISecondaryButton
