import React, { FC } from 'react'
import { View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

import { fonts, statuses } from '../../../styles/colors'

export interface IProps {
  size?: number
  color?: string
  backgroundColor?: string
}

const SSICheckmarkBadge: FC<IProps> = (props: IProps): JSX.Element => {
  const { size = 15, color = fonts.light, backgroundColor = statuses.valid } = props

  return (
    <View style={{ width: size, aspectRatio: 1 }}>
      <Svg width="100%" height="100%" viewBox="0 0 15 15" fill="none">
        <Circle cx="7.5" cy="7.5" r="7.5" fill={backgroundColor} />
        <Path
          d="M5.91233 11.0361H5.9092C5.84998 11.0357 5.79144 11.0236 5.73697 11.0005C5.6825 10.9774 5.63319 10.9437 5.59192 10.9015L3.13412 8.38546C3.09155 8.34399 3.05776 8.29447 3.03473 8.23981C3.0117 8.18516 2.99989 8.12647 3 8.06722C3.00011 8.00796 3.01214 7.94932 3.03538 7.89475C3.05862 7.84018 3.09259 7.79079 3.13531 7.74947C3.17803 7.70815 3.22863 7.67575 3.28412 7.65417C3.33962 7.63259 3.3989 7.62226 3.45847 7.6238C3.51804 7.62534 3.5767 7.63871 3.63099 7.66312C3.68529 7.68754 3.73413 7.72251 3.77463 7.76597L5.91665 9.95833L10.9927 4.91088C11.077 4.82993 11.1898 4.78514 11.307 4.78615C11.4242 4.78716 11.5363 4.8339 11.6191 4.91629C11.702 4.99869 11.749 5.11015 11.75 5.22667C11.751 5.34319 11.706 5.45544 11.6246 5.53926L6.22827 10.9059C6.14448 10.9893 6.03084 11.0361 5.91233 11.0361Z"
          fill={color}
        />
      </Svg>
    </View>
  )
}

export default SSICheckmarkBadge
