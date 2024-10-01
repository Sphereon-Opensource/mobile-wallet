import {fontColors} from '@sphereon/ui-components.core';
import React from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export interface IProps {
  width?: number;
  height?: number;
  color?: ColorValue;
}

const SSIPersonIcon = (props: IProps) => {
  const {width = 18, height = 16, color = fontColors.light} = props;

  return (
    <View style={{height, width}}>
      <Svg width="100%" height="100%" viewBox="0 0 18 16" fill="none">
        <Path
          d="M5.53118 4.02551C5.53118 2.13216 7.07876 0.591061 8.99937 0.591061C10.92 0.591061 12.4676 2.13216 12.4676 4.02551C12.4676 5.91887 10.92 7.45996 8.99937 7.45996C7.07876 7.45996 5.53118 5.91887 5.53118 4.02551ZM1.5227 12.9687C1.5227 12.5081 1.75109 12.0635 2.22356 11.6311C2.69952 11.1955 3.38479 10.8109 4.18698 10.4922C5.79203 9.85464 7.72848 9.53421 8.99937 9.53421C10.2703 9.53421 12.2067 9.85464 13.8118 10.4922C14.614 10.8109 15.2992 11.1955 15.7752 11.6311C16.2477 12.0635 16.476 12.5081 16.476 12.9687V15.4094H1.5227V12.9687Z"
          stroke={color}
          stroke-width="1.0000"
        />
      </Svg>
    </View>
  );
};

export default SSIPersonIcon;
