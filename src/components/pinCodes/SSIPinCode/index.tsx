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
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';

// Fixed character boxes are only legible up to this many; above it (or when the issuer does not
// announce a tx_code length at all) we render a single free-form input field instead.
const MAX_SEGMENTED_LENGTH = 6;

const {v4: uuidv4} = require('uuid');

interface IProps {
  length?: number;
  inputMode?: 'numeric' | 'text';
  maxRetries?: number;
  secureCode?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  errorMessage?: string;
  onMaxRetriesExceeded?: () => Promise<void>;
  onVerification: (value: string) => Promise<void>;
  autoFocus?: boolean;
}

interface IState {
  // undefined = length not announced by the issuer (free-form input, unknown length).
  length: number | undefined;
  freeInput: boolean;
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
    length: this.props.length,
    // Use a single free-form input when the length is unknown or too long for legible boxes.
    freeInput: this.props.length === undefined || this.props.length < 1 || this.props.length > MAX_SEGMENTED_LENGTH,
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
    this.hideKeyboard();
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
      this.setInputFocus();
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

  // Free-form input (unknown or long tx_code): filter to the allowed character set, cap at the
  // known length when the issuer announced one, and submit via the explicit confirm button.
  onChangeFreeInput = (text: string): void => {
    const allowed = this.props.inputMode === 'text' ? text.replace(/[^a-zA-Z0-9]/g, '') : text.replace(/[^0-9]/g, '');
    const capped = this.state.length !== undefined ? allowed.slice(0, this.state.length) : allowed;
    this.setState({pin: capped, showErrorMessage: false});
  };

  onKeyPressInput = async ({nativeEvent: {key}}: {nativeEvent: {key: string}}): Promise<void> => {
    const {length, pin} = this.state;
    if (length === undefined) {
      return;
    }
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
          const isValid = this.props.inputMode === 'text' ? /^[a-zA-Z0-9]$/.test(key) : ONLY_ALLOW_NUMBERS_REGEX.test(key);
          if (!isValid) {
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

    if (length !== undefined && event.nativeEvent.text.length >= length) {
      this.submit(event.nativeEvent.text);
    } else {
      this.failureAnimation();
      this.setInputFocus();
    }
  };

  onRef = (input: TextInput | null): void => {
    this.setState({inputRef: input});
  };

  renderFreeInput() {
    const {accessibilityLabel, accessibilityHint, errorMessage} = this.props;
    const {pin, length, shakeAnimation, secureCode, maxRetries, retry, showErrorMessage} = this.state;
    // With a known (long) length require an exact match; with an unknown length accept any non-empty code.
    const canSubmit = length !== undefined ? pin.length === length : pin.length > 0;
    return (
      <Container>
        <Animated.View style={{left: shakeAnimation, width: '100%', alignItems: 'center'}}>
          <TextInput
            ref={this.onRef}
            style={{
              minWidth: 220,
              borderWidth: 1,
              borderColor: '#FBFBFB',
              borderRadius: 8,
              color: '#FBFBFB',
              fontSize: 20,
              textAlign: 'center',
              letterSpacing: 4,
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
            accessible
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole={'text'}
            keyboardType={this.props.inputMode === 'text' ? 'default' : 'number-pad'}
            autoFocus={this.props.autoFocus}
            secureTextEntry={secureCode}
            {...(length !== undefined && {maxLength: length})}
            value={pin}
            onChangeText={this.onChangeFreeInput}
            onSubmitEditing={() => canSubmit && this.submit(pin)}
          />
        </Animated.View>
        {errorMessage && showErrorMessage && <ErrorMessageText>{errorMessage}</ErrorMessageText>}
        {maxRetries && retry > 0 && <AttemptsLeftText>{`${translate('pin_code_attempts_left_message')} ${maxRetries - retry}`}</AttemptsLeftText>}
        <View style={{marginTop: 24, width: 220, alignSelf: 'center'}}>
          <PrimaryButton
            caption={translate('action_confirm_label')}
            disabled={!canSubmit}
            style={{width: '100%'}}
            onPress={async () => canSubmit && this.submit(pin)}
          />
        </View>
      </Container>
    );
  }

  render() {
    if (this.state.freeInput) {
      return this.renderFreeInput();
    }

    const {accessibilityLabel, accessibilityHint, errorMessage} = this.props;
    const {pin, length, shakeAnimation, colorShiftAnimation, secureCode, maxRetries, retry, showErrorMessage} = this.state;
    const count = length ?? 0;

    const colorShiftAnimationStyle = {
      backgroundColor: colorShiftAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [backgroundColors.primaryLight, statusColors.error],
      }),
    };

    const segments = [];
    for (let i = 0; i < count; i++) {
      segments.push(
        <View key={uuidv4()} style={{marginRight: i === count - 1 ? 0 : 12}}>
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
            style={{position: 'absolute', opacity: 0, width: 1, height: 1}}
            accessible
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole={'text'}
            keyboardType={this.props.inputMode === 'text' ? 'default' : 'number-pad'}
            autoFocus={this.props.autoFocus}
            caretHidden
            maxLength={count}
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
