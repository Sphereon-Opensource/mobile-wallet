import { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types'
import React, { PureComponent } from 'react'
import { EmitterSubscription, Keyboard, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { HIT_SLOP_DISTANCE } from '../../../@config/constants'
import { NavigationBarRoutesEnum } from '../../../@types'
import { fonts, highLightGradients } from '../../../styles/colors'
import {
  SSINavigationBarButtonStyled as Button,
  SSINavigationBarContainerStyled as Container
} from '../../../styles/components'
import SSIBellIcon from '../../assets/icons/SSIBellIcon'
import SSIContactsIcon from '../../assets/icons/SSIContactsIcon'
import SSIHomeIcon from '../../assets/icons/SSIHomeIcon'
import SSIQRIcon from '../../assets/icons/SSIQRIcon'

interface IScreenState {
  isVisible: boolean
}

export class SSINavigationBar extends PureComponent<BottomTabBarProps, IScreenState> {
  private keyboardDidShowListener: EmitterSubscription
  private keyboardDidHideListener: EmitterSubscription

  constructor(props: BottomTabBarProps) {
    super(props)

    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardWillShow.bind(this))
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardWillHide.bind(this))

    this.state = {
      isVisible: true
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  keyboardWillShow = () => {
    this.setState({
      isVisible: false
    })
  }

  keyboardWillHide = () => {
    this.setState({
      isVisible: true
    })
  }

  render() {
    return this.state.isVisible ? (
      <SafeAreaView edges={['bottom']}>
        <Container>
          {this.props.state.routes.map((route, index) => {
            const { options } = this.props.descriptors[route.key]
            const isFocused = this.props.state.index === index

            const onPress = () => {
              const event = this.props.navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true
              })

              if (!isFocused && !event.defaultPrevented) {
                // The `merge: true` option makes sure that the params inside the tab screen are preserved
                this.props.navigation.navigate(route.name, { merge: true })
              }
            }

            return (
              <Button
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                hitSlop={{
                  top: HIT_SLOP_DISTANCE,
                  bottom: HIT_SLOP_DISTANCE,
                  left: HIT_SLOP_DISTANCE,
                  right: HIT_SLOP_DISTANCE
                }}
              >
                {getNavigationIcon(route.name, isFocused)}
              </Button>
            )
          })}
        </Container>
      </SafeAreaView>
    ) : null
  }
}

const getNavigationIcon = (route: string, isFocused: boolean): JSX.Element => {
  switch (route) {
    case NavigationBarRoutesEnum.QR:
      return (
        <SSIQRIcon
          primaryColor={isFocused ? highLightGradients['200'].primaryColor : fonts.light}
          secondaryColor={isFocused ? highLightGradients['200'].secondaryColor : fonts.light}
        />
      )
    case NavigationBarRoutesEnum.NOTIFICATIONS:
      return (
        <SSIBellIcon
          primaryColor={isFocused ? highLightGradients['200'].primaryColor : fonts.light}
          secondaryColor={isFocused ? highLightGradients['200'].secondaryColor : fonts.light}
        />
      )
    case NavigationBarRoutesEnum.CREDENTIALS:
      return (
        <SSIHomeIcon
          primaryColor={isFocused ? highLightGradients['200'].primaryColor : fonts.light}
          secondaryColor={isFocused ? highLightGradients['200'].secondaryColor : fonts.light}
        />
      )
    case NavigationBarRoutesEnum.CONTACTS:
      return (
        <SSIContactsIcon
          primaryColor={isFocused ? highLightGradients['200'].primaryColor : fonts.light}
          secondaryColor={isFocused ? highLightGradients['200'].secondaryColor : fonts.light}
        />
      )
    default:
      return <View />
  }
}

export default SSINavigationBar
