import React, {FC} from 'react';
import {ColorValue, View, ViewStyle} from 'react-native';
import Svg, {Path} from 'react-native-svg';

export type IProps = {style?: ViewStyle} & {
  size?: number;
  color?: ColorValue;
};

const ShareFailureIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const {size = 20, color = '#E7C9BB', style = {}} = props;

  return (
    <View style={{width: size, aspectRatio: 1, ...style}}>
      <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
        <Path
          d="M9.99926 1.91797C14.4743 1.91797 18.0822 5.52445 18.0822 9.99852C18.0822 14.4741 14.4743 18.0809 9.99926 18.0809C5.52565 18.0809 1.91777 14.4741 1.91777 9.99852C1.91777 5.52445 5.52565 1.91797 9.99926 1.91797ZM9.99926 0C4.48749 0 0 4.48795 0 9.99823C0 15.5106 4.48749 20 9.99926 20C15.511 20 20 15.5106 20 9.99823C20 4.48795 15.511 0 9.99926 0Z"
          fill={color}
        />
        <Path
          d="M15.0749 4.0004C14.8417 4.00732 14.6201 4.10393 14.4576 4.2725L4.27893 14.4483C3.91338 14.7959 3.9062 15.3783 4.2629 15.7357C4.6185 16.0933 5.19985 16.0875 5.54799 15.7213L15.7253 5.54555C16.3127 4.97338 15.8939 3.97715 15.0749 4.0004Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default ShareFailureIcon;
