import {StyleProp, ViewStyle} from 'react-native';
import Animated, {AnimatedStyle, SharedValue} from 'react-native-reanimated';
import {SSILinearGradientStyled} from '../../../styles/components';

type Props = {
  width: number;
  left: SharedValue<number>;
  indicatorComponent?: JSX.Element;
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
};

const DefaultIndicator = <SSILinearGradientStyled style={{flex: 1, height: 2}} />;

const defaultStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>> = {
  position: 'absolute',
  bottom: -1,
  zIndex: 0,
};

const Indicator = ({left, width, style = {}, indicatorComponent = DefaultIndicator}: Props) => (
  <Animated.View style={[{left, width}, defaultStyle, style]}>{indicatorComponent}</Animated.View>
);

export default Indicator;
