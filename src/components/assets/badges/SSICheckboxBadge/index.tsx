import React, { FC } from 'react'
import { View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

export interface IProps {
  size?: number
  color?: string
  backgroundColor?: string
}

const SSICheckboxBadge: FC<IProps> = (props: IProps): JSX.Element => {
  const { size = 15, color = '#FBFBFB', backgroundColor = '#0B81FF' } = props // TODO color check size 16 vs 26

  return (
    <View style={{ width: size, aspectRatio: 1 }}>
      <Svg width="100%" height="100%" viewBox="0 0 15 15" fill="none">
        <Circle cx="7.5" cy="7.5" r="7.5" fill={backgroundColor} />
        <Path
          d="M5.94805 11.4286H5.94474C5.88189 11.4281 5.81976 11.4142 5.76196 11.3878C5.70416 11.3614 5.65183 11.3229 5.60803 11.2747L2.99975 8.39922C2.95458 8.35182 2.91872 8.29523 2.89428 8.23277C2.86984 8.1703 2.8573 8.10324 2.85742 8.03551C2.85754 7.96779 2.87031 7.90077 2.89497 7.83841C2.91963 7.77605 2.95568 7.71959 3.00102 7.67238C3.04635 7.62516 3.10005 7.58813 3.15894 7.56346C3.21784 7.5388 3.28074 7.527 3.34396 7.52875C3.40718 7.53051 3.46943 7.54579 3.52705 7.5737C3.58467 7.6016 3.6365 7.64156 3.67948 7.69124L5.95264 10.1968L11.3394 4.42827C11.4289 4.33576 11.5487 4.28457 11.673 4.28572C11.7974 4.28688 11.9163 4.3403 12.0042 4.43446C12.0922 4.52863 12.142 4.65601 12.1431 4.78917C12.1442 4.92234 12.0964 5.05063 12.01 5.14642L6.28334 11.2798C6.19442 11.375 6.07382 11.4285 5.94805 11.4286Z"
          fill={color}
        />
      </Svg>
    </View>
  )
}

export default SSICheckboxBadge
