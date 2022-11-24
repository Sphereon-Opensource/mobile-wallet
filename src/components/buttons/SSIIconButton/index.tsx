import React, { FC } from 'react'
import { PressableProps, TouchableOpacity, View, ViewStyle } from 'react-native'

import { HIT_SLOP_DISTANCE } from '../../../@config/constants'
import { ButtonIconsEnum } from '../../../@types'
import SSIBackIcon from '../../../assets/icons/back.svg'
import SSIMoreIcon from '../../../assets/icons/more.svg'
import SSICloseIcon from '../../assets/icons/SSICloseIcon'

export interface Props extends PressableProps {
  icon: ButtonIconsEnum
  onPress: () => void
  disabled?: boolean | undefined
  style?: ViewStyle
  iconSize?: number
  iconColor?: string
}

// TODO add feedback to button
const SSIIconButton: FC<Props> = (props: Props): JSX.Element => {
  return (
    <TouchableOpacity
      style={props.style}
      onPress={props.onPress}
      disabled={props.disabled}
      hitSlop={{
        top: HIT_SLOP_DISTANCE,
        bottom: HIT_SLOP_DISTANCE,
        left: HIT_SLOP_DISTANCE,
        right: HIT_SLOP_DISTANCE
      }}
    >
      {getIcon(props.icon, props.iconSize, props.iconColor)}
    </TouchableOpacity>
  )
}

const getIcon = (icon: ButtonIconsEnum, size?: number, color?: string): JSX.Element => {
  switch (icon) {
    case ButtonIconsEnum.BACK:
      return <SSIBackIcon />
    case ButtonIconsEnum.MORE:
      return <SSIMoreIcon />
    case ButtonIconsEnum.CLOSE:
      return <SSICloseIcon size={size} color={color} />
    default:
      return <View />
  }
}

export default SSIIconButton
