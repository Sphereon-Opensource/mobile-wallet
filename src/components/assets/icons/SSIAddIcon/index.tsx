import React, {FC} from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {fontColors} from '@sphereon/ui-components.core';

export interface IProps {
  size?: number;
  color?: ColorValue;
}

const SSIAddIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const {size = 20, color = fontColors.dark} = props;

  return (
    <View style={{width: size, aspectRatio: 1}}>
      <Svg width="100%" height="100%" viewBox="0 0 19 21" fill="none">
        <Path
          d="M10 0C9.53978 0 9.16667 0.373111 9.16667 0.833333V9.1667H0.833333C0.373083 9.1667 0 9.53978 0 10C0 10.4603 0.373083 10.8334 0.833333 10.8334H9.16667V19.1667C9.16667 19.6269 9.53978 20 10 20C10.4603 20 10.8333 19.6269 10.8333 19.1667V10.8334H19.1667C19.6269 10.8334 20 10.4603 20 10C20 9.53978 19.6269 9.1667 19.1667 9.1667H10.8333V0.833333C10.8333 0.373111 10.4603 0 10 0Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default SSIAddIcon;
