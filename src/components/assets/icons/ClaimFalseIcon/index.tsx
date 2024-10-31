import {fontColors} from '@sphereon/ui-components.core';
import React from 'react';
import {ColorValue, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

export interface IProps {
  width?: number;
  height?: number;
}

const ClaimFalseIcon = (props: IProps) => {
  const {width = 15, height = 15} = props;

  return (
    <View style={{height, width}}>
      <Svg width="100%" height="100%" viewBox="0 0 15 15" fill="none">
        <Circle cx="7.5" cy="7.5" r="7.5" fill="#D74500" />
        <Path
          d="M7.10345 7.5L4.53213 4.92868L4.53213 4.92868C4.42263 4.81917 4.42262 4.64164 4.53213 4.53214L7.10345 7.5ZM7.10345 7.5L4.53214 10.0713L4.53214 10.0713C4.42264 10.1808 4.42263 10.3584 4.53213 10.4679L4.53214 10.4679C4.64164 10.5774 4.81918 10.5774 4.92868 10.4679L4.89333 10.4325L4.92868 10.4679L7.5 7.89655L10.0713 10.4679C10.1808 10.5774 10.3584 10.5774 10.4679 10.4679C10.5774 10.3584 10.5774 10.1808 10.4679 10.0713L7.89654 7.5L10.4679 4.92867C10.5774 4.81917 10.5774 4.64164 10.4679 4.53213C10.3584 4.42262 10.1808 4.42263 10.0713 4.53213L10.1067 4.56748L10.0713 4.53213L7.5 7.10346L4.92867 4.53214C4.92867 4.53214 4.92867 4.53214 4.92867 4.53214C4.81917 4.42263 4.64164 4.42263 4.53213 4.53214L7.10345 7.5Z"
          fill="#FBFBFB"
          stroke="#FBFBFB"
          strokeWidth="0.1"
        />
      </Svg>
    </View>
  );
};

export default ClaimFalseIcon;
