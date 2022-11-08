import React, { FC } from 'react'
import { PressableProps, ViewStyle } from 'react-native'

import { OpacityStyleEnum } from '../../../@types'
import {
  SSITouchableOpacityButtonFlexRowStyled as Button,
  SSITextH2LightStyled as ButtonCaption,
  SSIRoundedCenteredLinearGradientStyled as PrimaryButton
} from '../../../styles/styledComponents'

export interface Props extends PressableProps {
  title: string
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
      <PrimaryButton style={{ ...props.style }}>
        <ButtonCaption>{props.title}</ButtonCaption>
      </PrimaryButton>
    </Button>
  )
}

export default SSIPrimaryButton
