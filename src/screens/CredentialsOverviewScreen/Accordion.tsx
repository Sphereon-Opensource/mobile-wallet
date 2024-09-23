import React from 'react';
import {View} from 'react-native';
import Animated, {SharedValue, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';

type ItemProps = {
  isExpanded: SharedValue<boolean>;
  children: React.ReactNode;
  viewKey: string;
  style?: any;
  duration?: number;
};

export const CARD_HEIGHT = 200;
export const Accordion = ({isExpanded, children, viewKey, style, duration = 500}: ItemProps) => {
  const height = useSharedValue(150);
  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value, {
      duration,
    }),
  );
  const bodyStyle = useAnimatedStyle(() => ({
    height: CARD_HEIGHT,
  }));

  console.log(viewKey, height);
  return (
    <Animated.View
      key={`accordion_${viewKey}`}
      style={[
        {
          width: '100%',
          overflow: 'hidden',
        },
        bodyStyle,
        style,
      ]}>
      <View
        onLayout={e => {
          // height.value = 300;
        }}
        style={{
          width: '100%',
          // position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          // paddingBottom: 12,
        }}>
        {children}
      </View>
    </Animated.View>
  );
};
