import React, {FC} from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

import {fonts, statuses} from '../../../../styles/colors';

export interface IProps {
  size?: number;
  color?: ColorValue;
  backgroundColor?: ColorValue;
}

const SSIExclamationMarkBadge: FC<IProps> = (props: IProps): JSX.Element => {
  const {size = 15, color = fonts.light, backgroundColor = statuses.error} = props;

  return (
    <View style={{width: size, aspectRatio: 1}}>
      <Svg width="100%" height="100%" viewBox="0 0 15 15" fill="none">
        <Circle cx="7.5" cy="7.5" r="7.5" fill={backgroundColor} />
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M6.78571 3.48218C6.78571 3.33429 6.94559 3.21429 7.14279 3.21429H7.8572C8.05439 3.21429 8.21428 3.33429 8.21428 3.48218V9.37504C8.21428 9.52293 8.05439 9.64283 7.8572 9.64283H7.14279C6.94559 9.64283 6.78571 9.52292 6.78571 9.37504V3.48218ZM6.78571 10.9822C6.78571 10.8342 6.94559 10.7143 7.14279 10.7143H7.8572C8.05439 10.7143 8.21428 10.8342 8.21428 10.9822V11.5178C8.21428 11.6657 8.05439 11.7857 7.8572 11.7857H7.14279C6.94559 11.7857 6.78571 11.6657 6.78571 11.5178V10.9822Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default SSIExclamationMarkBadge;
