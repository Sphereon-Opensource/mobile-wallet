import React, {FC} from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {fontColors} from '@sphereon/ui-components.core';

export interface IProps {
  width?: number;
  height?: number;
  color?: ColorValue;
}

const SSIMoreIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const {width = 20, height = 4, color = fontColors.light} = props;

  return (
    <View style={{width, height}}>
      <Svg width="100%" height="100%" viewBox="0 0 20 4" fill="none">
        <Circle cx="2" cy="2" r="2" fill={color} />
        <Circle cx="10" cy="2" r="2" fill={color} />
        <Circle cx="18" cy="2" r="2" fill={color} />
      </Svg>
    </View>
  );
};

export default SSIMoreIcon;
