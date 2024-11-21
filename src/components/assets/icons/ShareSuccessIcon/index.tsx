import React, {FC} from 'react';
import {ColorValue, View, ViewStyle} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export type IProps = {style?: ViewStyle} & {
  size?: number;
  color?: ColorValue;
};

const ShareSuccessIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const {size = 20, color = '#BAE3CB', style = {}} = props;

  return (
    <View style={{width: size, aspectRatio: 1, ...style}}>
      <Svg width="100%" height="100%" viewBox="0 0 16 12" fill="none">
        <Path
          d="M4.25662 11.6505L0.833496 8.22742L4.25662 4.8045L4.74225 5.27388L2.12204 7.89409H8.42329V8.56075H2.12204L4.74225 11.181L4.25662 11.6505ZM11.7437 7.1795L11.2581 6.70992L13.8783 4.08971H7.57704V3.42304H13.8783L11.2581 0.802835L11.7437 0.333252L15.1668 3.75638L11.7437 7.1795Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default ShareSuccessIcon;
