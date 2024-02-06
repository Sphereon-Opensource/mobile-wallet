import React, {FC} from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {fontColors} from '@sphereon/ui-components.core';

export interface IProps {
  size?: number;
  color?: ColorValue;
}

const SSICloseIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const {size = 12, color = fontColors.dark} = props;

  return (
    <View style={{width: size, aspectRatio: 1}}>
      <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
        <Path
          d="M11.3763 0.623718C11.2113 0.45875 10.9439 0.458771 10.7789 0.623718L5.99999 5.40265L1.22108 0.623744C1.05612 0.458776 0.788685 0.458776 0.62372 0.623744C0.458759 0.788692 0.458761 1.05613 0.623722 1.2211L5.40263 6L0.623735 10.7789C0.458779 10.9439 0.458773 11.2113 0.623733 11.3763C0.788697 11.5412 1.05614 11.5412 1.2211 11.3763L5.99999 6.59737L10.7789 11.3763C10.9439 11.5412 11.2113 11.5412 11.3763 11.3763C11.5412 11.2113 11.5412 10.9439 11.3763 10.7789L6.59736 6L11.3763 1.22107C11.5412 1.05612 11.5412 0.788687 11.3763 0.623718Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default SSICloseIcon;
