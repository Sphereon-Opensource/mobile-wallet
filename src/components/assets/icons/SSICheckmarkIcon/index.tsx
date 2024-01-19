import React, {FC} from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {fontColors} from '@sphereon/ui-components.core';

export interface IProps {
  height?: number;
  width?: number;
  color?: ColorValue;
}

// TODO use checkmark in checkmark badge
const SSICheckmarkIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const {height = 14, width = 17, color = fontColors.light} = props;

  return (
    <View style={{height, width}}>
      <Svg width={width} height={height} viewBox="0 0 17 14" fill="none">
        <Path
          d="M5.65824 13.5H5.65216C5.5371 13.4991 5.42336 13.4739 5.31754 13.4258C5.21171 13.3778 5.11592 13.3078 5.03573 13.2199L0.260569 7.9866C0.177876 7.90034 0.112223 7.79733 0.0674744 7.68365C0.0227257 7.56997 -0.000214902 7.44791 1.51707e-06 7.32465C0.000217936 7.20139 0.023587 7.07942 0.0687346 6.96592C0.113882 6.85242 0.179896 6.74968 0.262892 6.66374C0.345888 6.5778 0.44419 6.51041 0.552013 6.46552C0.659837 6.42063 0.775004 6.39915 0.89074 6.40235C1.00648 6.40555 1.12044 6.43336 1.22593 6.48414C1.33142 6.53493 1.42631 6.60766 1.505 6.69807L5.66663 11.2582L15.5286 0.759474C15.6924 0.591097 15.9117 0.497929 16.1393 0.500035C16.367 0.502141 16.5847 0.599353 16.7457 0.770734C16.9067 0.942115 16.998 1.17395 17 1.41631C17.0019 1.65867 16.9144 1.89216 16.7563 2.06649L6.27206 13.2292C6.10928 13.4025 5.88848 13.4999 5.65824 13.5Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default SSICheckmarkIcon;
