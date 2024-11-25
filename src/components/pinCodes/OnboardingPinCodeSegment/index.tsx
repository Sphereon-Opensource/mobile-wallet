import {backgroundColors} from '@sphereon/ui-components.core';
import React from 'react';
import {View, ViewStyle} from 'react-native';
import {
  OnboardingPinCodeSegmentTextStyled as SegmentText,
  OnboardingPinCodeSegmentTextContainerStyled as TextContainer,
} from '../../../styles/components';

export interface Props {
  value: string;
  isCurrent: boolean;
  style?: ViewStyle;
}

const OnboardingPinCodeSegment = (props: Props) => (
  <View style={{flex: 1}}>
    <TextContainer>
      <SegmentText>{props.value}</SegmentText>
    </TextContainer>
    <View
      style={{
        height: 2,
        backgroundColor: props.isCurrent || Boolean(props.value) ? backgroundColors.primaryLight : '#8D9099',
      }}
    />
  </View>
);

export default OnboardingPinCodeSegment;
