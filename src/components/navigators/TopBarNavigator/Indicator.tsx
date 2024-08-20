import {StyleProp, ViewStyle} from 'react-native';
import Animated, {AnimatedStyle, SharedValue} from 'react-native-reanimated';
import {SSILinearGradientStyled} from '../../../styles/components';

type Props = {
  width: number;
  left: SharedValue<number>;
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
};

const defaultStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>> = {
  position: 'absolute',
  bottom: -1,
  height: 2,
  zIndex: 2,
};

const Indicator = ({left, width, style = {}}: Props) => (
  <Animated.View style={[{left, width}, defaultStyle, style]}>
    <SSILinearGradientStyled style={{flex: 1}} />
  </Animated.View>
);

export default Indicator;
