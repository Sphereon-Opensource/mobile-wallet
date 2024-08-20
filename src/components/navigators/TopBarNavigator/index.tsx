import {MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {ParamListBase, TabNavigationState, createNavigatorFactory} from '@react-navigation/native';
import {useState} from 'react';
import {View, ViewStyle} from 'react-native';
import {ParamsList} from '../../../types';
import Tabs, {Props as TabsProps} from './Tabs';

type TapBarProps<T extends ParamsList> = Pick<TabsProps<T>, 'containerStyle' | 'labels' | 'indicatorProportionalWidth' | 'indicatorStyle'>;

type Props<T extends ParamsList> = {
  children: React.ReactNode;
  tapBarProps: TapBarProps<T>;
  initialRouteName: Extract<keyof T, string>;
  wrapperStyle?: Omit<ViewStyle, 'width'> & {width?: number};
};

const TopBarNavigator = <T extends ParamsList>({children, tapBarProps, initialRouteName, wrapperStyle}: Props<T>) => {
  const TopTabNav = createMaterialTopTabNavigator<T>();
  const tapBarWidth = tapBarProps?.containerStyle?.width;
  const [width, setWidth] = useState<number>(wrapperStyle?.width ?? 0);
  return (
    <View style={[{position: 'relative', flex: 1}, wrapperStyle]} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <TopTabNav.Navigator
        initialRouteName={initialRouteName}
        tabBar={({state, navigation, ...rest}) => (
          <Tabs
            state={state as TabsProps<T>['state']}
            navigation={navigation as TabsProps<T>['navigation']}
            containerWidth={tapBarWidth ?? width}
            {...tapBarProps}
            {...rest}
          />
        )}>
        {children}
      </TopTabNav.Navigator>
    </View>
  );
};

export const createTopBarNavigator = createNavigatorFactory<
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
  typeof TopBarNavigator
>(TopBarNavigator);
