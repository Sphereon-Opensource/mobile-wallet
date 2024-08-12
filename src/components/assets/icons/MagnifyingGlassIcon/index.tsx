import React, {FC} from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {fontColors} from '@sphereon/ui-components.core';

export interface IProps {
  size?: number;
  color?: ColorValue;
}

const MagnifyingGlassIcon: FC<IProps> = (props: IProps): JSX.Element => {
  const {size = 15, color = fontColors.dark} = props;

  return (
    <View style={{width: size, height: size}}>
      <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
        <Path
          d="M11.2204 9.93396H10.5429L10.3027 9.7024C11.1432 8.7247 11.6492 7.4554 11.6492 6.07461C11.6492 2.99571 9.15352 0.5 6.07461 0.5C2.99571 0.5 0.5 2.99571 0.5 6.07461C0.5 9.15352 2.99571 11.6492 6.07461 11.6492C7.4554 11.6492 8.7247 11.1432 9.7024 10.3027L9.93396 10.5429V11.2204L14.2221 15.5L15.5 14.2221L11.2204 9.93396ZM6.07461 9.93396C3.93911 9.93396 2.21527 8.21012 2.21527 6.07461C2.21527 3.93911 3.93911 2.21527 6.07461 2.21527C8.21012 2.21527 9.93396 3.93911 9.93396 6.07461C9.93396 8.21012 8.21012 9.93396 6.07461 9.93396Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default MagnifyingGlassIcon;
