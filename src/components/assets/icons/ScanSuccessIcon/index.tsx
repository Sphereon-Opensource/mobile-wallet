import {fontColors} from '@sphereon/ui-components.core';
import React from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

export interface IProps {
  width?: number;
  height?: number;
}

const ScanSuccessIcon = (props: IProps) => {
  const {width = 115, height = 114} = props;

  return (
    <View style={{height, width}}>
      <Svg width="100%" height="100%" viewBox="0 0 115 114" fill="none">
        <Circle cx="57.5" cy="57" r="54" stroke="#007AFF" strokeWidth="6" />
        <Path d="M36 59.5L51.5 78L79 36.5" stroke="#007AFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
};

export default ScanSuccessIcon;
