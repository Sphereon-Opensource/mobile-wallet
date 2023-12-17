import React, {FC} from 'react';
import {View, ViewStyle} from 'react-native';

import {
  SSIPinCodeSegmentUnderlineAnimatedStyled as AnimatedUnderline,
  SSIPinCodeSegmentUnderlineLinearGradientStyled as LinearGradientUnderline,
  SSIPinCodeSegmentTextStyled as SegmentText,
  SSIPinCodeSegmentTextContainerStyled as TextContainer,
} from '../../../styles/components';
import {backgroundColors} from '@sphereon/ui-components.core';

export interface IProps {
  value: string;
  isCurrent: boolean;
  style?: ViewStyle;
}

const SSIPinCodeSegment: FC<IProps> = (props: IProps): JSX.Element => {
  const segmentStyle = props.style ? props.style : {backgroundColor: backgroundColors.primaryLight};
  return (
    <View>
      <TextContainer>
        <SegmentText>{props.value}</SegmentText>
      </TextContainer>
      {props.isCurrent && <LinearGradientUnderline />}
      {!props.isCurrent && <AnimatedUnderline style={{...segmentStyle}} />}
    </View>
  );
};

export default SSIPinCodeSegment;
