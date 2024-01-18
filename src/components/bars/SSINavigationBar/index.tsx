import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React, {PureComponent} from 'react';
import {EmitterSubscription, Keyboard, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {HIT_SLOP_DISTANCE} from '../../../@config/constants';
import {
  SSINavigationBarButtonStyled as Button,
  SSINavigationBarContainerStyled as Container,
  SSINavigationBarSafeAreaContainerStyled as SafeAreaContainer,
} from '../../../styles/components';
import {NavigationBarRoutesEnum} from '../../../types';
import SSIBellIcon from '../../assets/icons/SSIBellIcon';
import SSIContactsIcon from '../../assets/icons/SSIContactsIcon';
import SSIHomeIcon from '../../assets/icons/SSIHomeIcon';
import SSIQRIcon from '../../assets/icons/SSIQRIcon';
import {fontColors, gradientsColors} from '@sphereon/ui-components.core';

interface IState {
  keyboardVisible: boolean;
}

class SSINavigationBar extends PureComponent<BottomTabBarProps, IState> {
  private keyboardDidShowListener: EmitterSubscription;
  private keyboardDidHideListener: EmitterSubscription;
  state: IState = {
    keyboardVisible: false,
  };

  componentDidMount = () => {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  };

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow = () => {
    this.setState({keyboardVisible: true});
  };

  _keyboardDidHide = () => {
    this.setState({keyboardVisible: false});
  };

  render() {
    return !this.state.keyboardVisible ? (
      <SafeAreaContainer>
        <SafeAreaView edges={['bottom']}>
          <Container>
            {this.props.state.routes.map((route, index: number) => {
              const {options} = this.props.descriptors[route.key];
              const isFocused = this.props.state.index === index;

              const onPress = () => {
                const event = this.props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  // The `merge: true` option makes sure that the params inside the tab screen are preserved
                  this.props.navigation.navigate(route.name, {merge: true});
                }
              };

              return (
                <Button
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? {selected: true} : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  hitSlop={{
                    top: HIT_SLOP_DISTANCE,
                    bottom: HIT_SLOP_DISTANCE,
                    left: HIT_SLOP_DISTANCE,
                    right: HIT_SLOP_DISTANCE,
                  }}>
                  {getNavigationIcon(route.name, isFocused)}
                </Button>
              );
            })}
          </Container>
        </SafeAreaView>
      </SafeAreaContainer>
    ) : null;
  }
}

const getNavigationIcon = (route: string, isFocused: boolean): JSX.Element => {
  switch (route) {
    case NavigationBarRoutesEnum.QR:
      return (
        <SSIQRIcon
          primaryColor={isFocused ? gradientsColors['200'].primaryColor : fontColors.light}
          secondaryColor={isFocused ? gradientsColors['200'].secondaryColor : fontColors.light}
        />
      );
    case NavigationBarRoutesEnum.NOTIFICATIONS:
      return (
        <SSIBellIcon
          primaryColor={isFocused ? gradientsColors['200'].primaryColor : fontColors.light}
          secondaryColor={isFocused ? gradientsColors['200'].secondaryColor : fontColors.light}
        />
      );
    case NavigationBarRoutesEnum.CREDENTIALS:
      return (
        <SSIHomeIcon
          primaryColor={isFocused ? gradientsColors['200'].primaryColor : fontColors.light}
          secondaryColor={isFocused ? gradientsColors['200'].secondaryColor : fontColors.light}
        />
      );
    case NavigationBarRoutesEnum.CONTACTS:
      return (
        <SSIContactsIcon
          primaryColor={isFocused ? gradientsColors['200'].primaryColor : fontColors.light}
          secondaryColor={isFocused ? gradientsColors['200'].secondaryColor : fontColors.light}
        />
      );
    default:
      return <View />;
  }
};

export default SSINavigationBar;
