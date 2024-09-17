import {fontColors} from '@sphereon/ui-components.core';
import React from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

export interface IProps {
  width?: number;
  height?: number;
}

const ScanIcon = (props: IProps) => {
  const {width = 115, height = 114} = props;

  return (
    <View style={{height, width}}>
      <Svg width="100%" height="100%" viewBox="0 0 115 114" fill="none">
        <Circle cx="57.5" cy="57" r="54" stroke="#007AFF" strokeWidth="6" />
        <Path
          d="M76.5169 31.4863H38.0215C33.6032 31.4863 30.0215 35.0681 30.0215 39.4863V100.28C30.0215 101.879 30.7781 103.397 32.1628 104.198C36.944 106.964 46.1949 110.752 57.2692 110.752C68.3434 110.752 77.5944 106.964 82.3756 104.198C83.7603 103.397 84.5169 101.879 84.5169 100.28V39.4863C84.5169 35.0681 80.9352 31.4863 76.5169 31.4863Z"
          fill="#E0EFFE"
          stroke="#007AFF"
          strokeWidth="3"
        />
        <Path d="M42.791 31.4863L44.7727 34.9542H69.5433L71.525 31.4863" stroke="#007AFF" strokeWidth="4" strokeLinejoin="round" />
      </Svg>
    </View>
  );
};

export default ScanIcon;
