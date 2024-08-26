import {MaterialTopTabBarProps, MaterialTopTabNavigationEventMap} from '@react-navigation/material-top-tabs';
import {NavigationHelpers, NavigationState} from '@react-navigation/native';
import {useCallback, useEffect} from 'react';
import {StyleProp, View, ViewProps, ViewStyle} from 'react-native';
import {AnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {ParamsList} from '../../../types';
import Indicator from './Indicator';
import Tab from './Tab';

const DEFAULT_INDICATOR_PROPORTION_WIDTH = 1;

// The MaterialTopTabBarProps passed don't allow for generic ParamList type so
// we have to apply the ParamsList type per usage explicitly by type shadowing.
// We could use useNavigation for the navigation prop, however the
// useNavigationState hook we could use for the state is not convenient as it
// starts at the root navigator state and it is cumbersome to get the state of
// the current navigator
export type Props<T extends ParamsList> = Omit<MaterialTopTabBarProps, 'state' | 'navigation'> & {
  state: NavigationState<T>;
  navigation: NavigationHelpers<T, MaterialTopTabNavigationEventMap>;
  labels: Record<keyof T, (isFocused: boolean) => JSX.Element>;
  containerWidth: number;
  containerStyle?: Omit<ViewStyle, 'width' | 'paddingLeft' | 'paddingRight'> & {
    width?: number;
    paddingHorizontal?: number;
  };
  renderIndicator?: JSX.Element;
  indicatorStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  indicatorProportionalWidth?: number;
};
const defaultContainerStyle: ViewProps['style'] = {
  flexDirection: 'row',
  paddingVertical: 4,
  borderBottomColor: '#404D7A',
  borderBottomWidth: 1,
};
const Tabs = <T extends ParamsList>({
  state: {routes, index: routeIndex},
  navigation,
  labels,
  containerWidth,
  containerStyle = {},
  renderIndicator,
  indicatorStyle,
  indicatorProportionalWidth = DEFAULT_INDICATOR_PROPORTION_WIDTH,
}: Props<T>) => {
  const numberOfTabs = routes.length;
  const tabsGap = containerStyle?.gap ?? 0;
  const tabsTotalGap = (numberOfTabs - 1) * tabsGap;
  const tabsHorizontalPadding = containerStyle?.paddingHorizontal ?? 0;
  const tabWidth = (containerWidth - tabsTotalGap - tabsHorizontalPadding * 2) / numberOfTabs;
  const indicatorWidth = tabWidth * indicatorProportionalWidth;
  const tabRemainingWidth = tabWidth - indicatorWidth;
  const getIndicatorLeft = useCallback(
    (i: number) => tabsHorizontalPadding + tabsGap * i + tabWidth * i + tabRemainingWidth / 2,
    [tabWidth, tabRemainingWidth],
  );
  const indicatorLeft = useSharedValue(getIndicatorLeft(routeIndex));
  useEffect(() => {
    indicatorLeft.value = withTiming(getIndicatorLeft(routeIndex), {duration: 200});
  }, [routeIndex, getIndicatorLeft]);
  return (
    <View style={[defaultContainerStyle, containerStyle]}>
      {routes.map((route, i) => (
        <Tab
          key={route.name}
          routeName={route.name}
          renderLabel={labels[route.name]}
          isFocused={routeIndex === i}
          onPress={() => (navigation.navigate as any)(route.name, route.params)}
        />
      ))}
      <Indicator indicatorComponent={renderIndicator} left={indicatorLeft} width={indicatorWidth} style={indicatorStyle} />
    </View>
  );
};
export default Tabs;
