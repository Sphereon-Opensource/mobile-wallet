import {fontColors} from '@sphereon/ui-components.core';
import React from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

export interface IProps {
  width?: number;
  height?: number;
}

const ClaimTrueIcon = (props: IProps) => {
  const {width = 15, height = 15} = props;

  return (
    <View style={{height, width}}>
      <Svg width="100%" height="100%" viewBox="0 0 15 15" fill="none">
        <Circle cx="7.5" cy="7.5" r="7.5" fill="#00C249" />
        <Path
          d="M6.18659 10.7142H6.18378C6.13061 10.7138 6.07804 10.7013 6.02913 10.6775C5.98022 10.6538 5.93594 10.6192 5.89888 10.5757L3.69187 7.98781C3.65365 7.94515 3.62331 7.89422 3.60263 7.838C3.58195 7.78178 3.57134 7.72142 3.57144 7.66047C3.57154 7.59952 3.58234 7.53921 3.60321 7.48308C3.62408 7.42695 3.65459 7.37614 3.69295 7.33365C3.73131 7.29115 3.77674 7.25782 3.82657 7.23563C3.87641 7.21343 3.92964 7.20281 3.98313 7.20439C4.03662 7.20597 4.08929 7.21972 4.13805 7.24484C4.18681 7.26995 4.23066 7.30592 4.26703 7.35062L6.19047 9.60561L10.7485 4.41396C10.8242 4.33069 10.9256 4.28462 11.0308 4.28566C11.136 4.2867 11.2367 4.33478 11.3111 4.41952C11.3855 4.50427 11.4277 4.61892 11.4286 4.73877C11.4295 4.85861 11.389 4.97408 11.3159 5.06028L6.47029 10.5803C6.39506 10.666 6.29301 10.7142 6.18659 10.7142Z"
          fill="#FBFBFB"
        />
      </Svg>
    </View>
  );
};

export default ClaimTrueIcon;
