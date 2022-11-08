import { PureComponent } from 'react'
import { Animated, TextInput, TouchableOpacity, View } from 'react-native'
import { NativeStackNavigationProp } from 'react-native-screens/native-stack'

import { translate } from '../../../localization/Localization'
import { backgrounds, statuses } from '../../../styles/colors'
import {
  SSIPinCodeAttemptsLeftTextStyled as AttemptsLeftText,
  SSIPinCodeErrorMessageTextStyled as ErrorMessageText,
  SSIPinCodeContainerAnimatedStyled as SegmentsContainer
} from '../../../styles/components'
import { SSIFlexDirectionColumnViewStyled as Container } from '../../../styles/styledComponents'
import SSIPinCodeSegment from '../SSIPinCodeSegment'

const { v4: uuidv4 } = require('uuid')

interface IScreenProps {
  length?: number
  maxRetries?: number
  secureCode?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  onMaxRetriesExceeded: () => Promise<void>
  onVerification: (pin: string) => Promise<void>
  // TODO Get a better solution to get the navigation in the pin code component. Or a solution to reset the state of a screen
  // TODO Reason is that it is nicer to reset the pincode to an empty state when navigating back. Which it does not do by default
  navigation?: NativeStackNavigationProp<any, any>
}

interface IScreenState {
  length: number
  maxRetries: number
  pin: string
  retry: number
  inputRef: TextInput | null
  secureCode: boolean
  shakeAnimation: any
  colorShiftAnimation: any
  showErrorMessage: boolean
}

export class SSIPinCode extends PureComponent<IScreenProps, IScreenState> {
  constructor(props: IScreenProps) {
    super(props)

    if (props.navigation) {
      props.navigation.addListener('focus', () => {
        this.setState({
          retry: 0,
          pin: ''
        })
      })
    }

    this.state = {
      inputRef: null,
      length: props.length || 4,
      maxRetries: props.maxRetries || 3,
      pin: '',
      retry: 0,
      secureCode: props.secureCode || true,
      shakeAnimation: new Animated.Value(0),
      colorShiftAnimation: new Animated.Value(0),
      showErrorMessage: false
    }
  }

  failureAnimation = () => {
    const { colorShiftAnimation, shakeAnimation } = this.state

    const values = [10, -7.5, 5, -2.5, 0]
    const shakeDuration = 100
    const colorShiftDuration = 100

    Animated.sequence(
      values.map((toValue) =>
        Animated.timing(shakeAnimation, { toValue, duration: shakeDuration, useNativeDriver: false })
      )
    ).start()

    Animated.timing(colorShiftAnimation, {
      toValue: 1,
      duration: colorShiftDuration,
      useNativeDriver: false
    }).start(() => {
      Animated.timing(colorShiftAnimation, {
        toValue: 0,
        duration: colorShiftDuration,
        useNativeDriver: false
      }).start()
    })
  }

  submit = (value: string) => {
    const { retry, maxRetries } = this.state

    this.props.onVerification(value).catch(async () => {
      const retries = retry + 1
      if (retries >= maxRetries) {
        this.hideKeyboard().then(() => {
          this.setState({
            retry: 0,
            pin: ''
          })
          this.props.onMaxRetriesExceeded()
        })
      } else {
        this.failureAnimation()
        this.setState({
          retry: retries,
          pin: '',
          showErrorMessage: true
        })
      }
    })
  }

  setInputFocus = () => {
    const { inputRef } = this.state

    inputRef!.clear()
    inputRef!.focus()
  }

  hideKeyboard = async () => {
    const { inputRef } = this.state

    inputRef!.focus()
    inputRef!.blur()
  }

  onKeyPressInput = ({ nativeEvent: { key } }: { nativeEvent: { key: string } }) => {
    const { length, pin } = this.state

    switch (key) {
      case 'Backspace':
        if (pin.length > 0) {
          this.setState({
            pin: pin.slice(0, -1)
          })
        }
        return
      default: {
        if (pin.length < length) {
          const value = pin.concat(key).replace(/[^0-9]/g, '')

          this.setState({
            pin: value,
            // We only want to hide the message if a valid key has been pressed
            showErrorMessage: value === pin
          })

          if (value.length >= length) {
            this.submit(value)
          }
        }
      }
    }
  }

  render() {
    const { accessibilityLabel, accessibilityHint } = this.props
    const { pin, length, shakeAnimation, colorShiftAnimation, secureCode, maxRetries, retry, showErrorMessage } =
      this.state

    const colorShiftAnimationStyle = {
      backgroundColor: colorShiftAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [backgrounds.primaryLight, statuses.error]
      })
    }

    const segments = []
    for (let i = 0; i < length; i++) {
      segments.push(
        <SSIPinCodeSegment
          key={uuidv4()}
          value={secureCode ? (pin.length === i + 1 ? pin.charAt(i) : i >= pin.length ? '' : '*') : pin.charAt(i)}
          isCurrent={pin.length === i}
          style={colorShiftAnimationStyle}
        />
      )
    }

    // TODO remove TouchableOpacity once we have a stable keyboard that does not hide
    return (
      <TouchableOpacity activeOpacity={1} onPress={this.setInputFocus}>
        <Container>
          <SegmentsContainer style={{ left: shakeAnimation }}>{segments}</SegmentsContainer>
          {retry > 0 && (
            <View>
              {showErrorMessage && (
                <ErrorMessageText>{translate('verification_code_invalid_code_message')}</ErrorMessageText>
              )}
              <AttemptsLeftText>{`${translate('verification_code_attempts_left_message')} ${
                maxRetries - retry
              }`}</AttemptsLeftText>
            </View>
          )}
          <TextInput
            ref={(input) => {
              this.setState({
                inputRef: input
              })
            }}
            style={{ display: 'none' }}
            accessible
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole={'text'}
            keyboardType={'number-pad'}
            autoFocus
            caretHidden
            maxLength={length}
            onKeyPress={this.onKeyPressInput}
            value={pin}
            onSubmitEditing={(event: { nativeEvent: { text: string } }) => {
              if (event.nativeEvent.text.length >= length) {
                this.submit(event.nativeEvent.text)
              } else {
                this.failureAnimation()
                this.setInputFocus()
              }
            }}
          />
        </Container>
      </TouchableOpacity>
    )
  }
}
