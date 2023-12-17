import React, {PureComponent} from 'react';
import {Animated, TextInput, TouchableOpacity, View} from 'react-native';

import {ONLY_ALLOW_NUMBERS_REGEX} from '../../../@config/constants';
import {translate} from '../../../localization/Localization';
import {
  SSIPinCodeAttemptsLeftTextStyled as AttemptsLeftText,
  SSIPinCodeContainerStyled as Container,
  SSIPinCodeErrorMessageTextStyled as ErrorMessageText,
  SSIPinCodeContainerAnimatedStyled as SegmentsContainer,
} from '../../../styles/components';
import SSIPinCodeSegment from '../SSIPinCodeSegment';
import {backgroundColors, statusColors} from '@sphereon/ui-components.core';

const {v4: uuidv4} = require('uuid');

interface IProps {
  length?: number;
  maxRetries?: number;
  secureCode?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  errorMessage?: string;
  onMaxRetriesExceeded?: () => Promise<void>;
  onVerification: (value: string) => Promise<void>;
}

interface IState {
  length: number;
  maxRetries: number | undefined;
  pin: string;
  retry: number;
  inputRef: TextInput | null;
  secureCode: boolean;
  shakeAnimation: any; // TODO fix type
  colorShiftAnimation: any; // TODO fix type
  showErrorMessage: boolean;
}

class SSIPinCode extends PureComponent<IProps, IState> {
  state: IState = {
    inputRef: null,
    length: this.props.length || 4,
    maxRetries: this.props.maxRetries,
    pin: '',
    retry: 0,
    secureCode: this.props.secureCode || true,
    shakeAnimation: new Animated.Value(0),
    colorShiftAnimation: new Animated.Value(0),
    showErrorMessage: false,
  };

  failureAnimation = (): void => {
    const {colorShiftAnimation, shakeAnimation} = this.state;

    const values = [10, -7.5, 5, -2.5, 0];
    const shakeDuration = 100;
    const colorShiftDuration = 100;

    Animated.sequence(values.map(toValue => Animated.timing(shakeAnimation, {toValue, duration: shakeDuration, useNativeDriver: false}))).start();

    Animated.timing(colorShiftAnimation, {
      toValue: 1,
      duration: colorShiftDuration,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(colorShiftAnimation, {
        toValue: 0,
        duration: colorShiftDuration,
        useNativeDriver: false,
      }).start();
    });
  };

  submit = (value: string): void => {
    const {onVerification} = this.props;

    onVerification(value)
      .then(() => this.setState({retry: 0}))
      .catch(this.onVerificationFailed);
  };

  onVerificationFailed = async (): Promise<void> => {
    const {onMaxRetriesExceeded} = this.props;
    const {retry, maxRetries} = this.state;
    if (!maxRetries) {
      this.setState({pin: '', showErrorMessage: true});
      this.failureAnimation();
      return;
    }

    const retries = retry + 1;
    if (retries >= maxRetries) {
      this.hideKeyboard().then(() => {
        this.setState({retry: 0, pin: ''});
        if (onMaxRetriesExceeded) {
          onMaxRetriesExceeded();
        }
      });
    } else {
      this.failureAnimation();
      this.setState({retry: retries, pin: '', showErrorMessage: true});
    }
  };

  setInputFocus = (): void => {
    const {inputRef} = this.state;

    if (inputRef !== null) {
      inputRef.blur();
      inputRef.focus();
    }
  };

  hideKeyboard = async (): Promise<void> => {
    const {inputRef} = this.state;

    if (inputRef !== null) {
      inputRef.focus();
      inputRef.blur();
    }
  };

  onKeyPressInput = async ({nativeEvent: {key}}: {nativeEvent: {key: string}}): Promise<void> => {
    const {length, pin} = this.state;
    if (pin.length < length) {
      switch (key) {
        case 'Backspace':
          if (pin.length > 0) {
            this.setState({
              pin: pin.slice(0, -1),
            });
          }
          return;
        default: {
          if (!ONLY_ALLOW_NUMBERS_REGEX.test(key)) {
            return;
          }

          const value = pin.concat(key);

          this.setState({
            pin: value,
            // We only want to hide the message if a valid key has been pressed
            showErrorMessage: value === pin,
          });

          if (value.length >= length) {
            this.submit(value);
          }
        }
      }
    }
  };

  onSubmitEditing = async (event: {nativeEvent: {text: string}}): Promise<void> => {
    const {length} = this.state;

    if (event.nativeEvent.text.length >= length) {
      this.submit(event.nativeEvent.text);
    } else {
      this.failureAnimation();
      this.setInputFocus();
    }
  };

  onRef = async (input: TextInput | null): Promise<void> => {
    this.setState({inputRef: input});
  };

  render() {
    const {accessibilityLabel, accessibilityHint, errorMessage} = this.props;
    const {pin, length, shakeAnimation, colorShiftAnimation, secureCode, maxRetries, retry, showErrorMessage} = this.state;

    const colorShiftAnimationStyle = {
      backgroundColor: colorShiftAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [backgroundColors.primaryLight, statusColors.error],
      }),
    };

    const segments = [];
    for (let i = 0; i < length; i++) {
      segments.push(
        <View key={uuidv4()} style={{marginRight: i === length - 1 ? 0 : 12}}>
          <SSIPinCodeSegment
            value={secureCode ? (pin.length === i + 1 ? pin.charAt(i) : i >= pin.length ? '' : '*') : pin.charAt(i)}
            isCurrent={pin.length === i}
            style={colorShiftAnimationStyle}
          />
        </View>,
      );
    }

    // TODO remove TouchableOpacity once we have a stable keyboard that does not hide
    return (
      <TouchableOpacity activeOpacity={1} onPress={this.setInputFocus}>
        <Container>
          <SegmentsContainer style={{left: shakeAnimation}}>{segments}</SegmentsContainer>
          {errorMessage && showErrorMessage && <ErrorMessageText>{errorMessage}</ErrorMessageText>}
          {maxRetries && retry > 0 && <AttemptsLeftText>{`${translate('pin_code_attempts_left_message')} ${maxRetries - retry}`}</AttemptsLeftText>}
          <TextInput
            ref={this.onRef}
            style={{display: 'none'}}
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
            onSubmitEditing={this.onSubmitEditing}
          />
        </Container>
      </TouchableOpacity>
    );
  }
}

export default SSIPinCode;
