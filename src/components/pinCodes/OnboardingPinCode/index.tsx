import React, {RefObject, useCallback, useEffect, useMemo} from 'react';
import {Animated, Keyboard, Platform, TextInput, TextInputProps, TouchableOpacity} from 'react-native';
import {ONLY_ALLOW_NUMBERS_REGEX} from '../../../@config/constants';
import {translate} from '../../../localization/Localization';
import {
  OnboardingPinCodeAttemptsLeftTextStyled as AttemptsLeftText,
  OnboardingPinCodeContainerStyled as Container,
  OnboardingPinCodeContainerAnimatedStyled as SegmentsContainer,
} from '../../../styles/components';
import OnboardingPinCodeSegment from '../OnboardingPinCodeSegment';

type ValidationConfig = {
  maxRetries?: number;
  onMaxRetriesExceeded?: () => void;
  isValid: boolean;
  hideKeyboardOnValidAndComplete?: boolean;
  triggerValidation?: 'onComplete' | 'onKeyPress';
};

type Props = TextInputProps & {
  pin: string;
  onPinChange: (value: string) => void;
  length?: number;
  secureCode?: boolean;
  validation?: ValidationConfig;
  inputRef?: RefObject<TextInput>;
};

const failureAnimationConfig = {
  values: [10, -7.5, 5, -2.5, 0],
  shakeDuration: 100,
  colorShiftDuration: 100,
};

const OnboardingPinCode = ({
  pin,
  onPinChange,
  length = 4,
  secureCode = true,
  validation,
  inputRef = React.useRef<TextInput | null>(null),
  ...textInputProps
}: Props) => {
  const {isValid, maxRetries, onMaxRetriesExceeded, hideKeyboardOnValidAndComplete = false, triggerValidation = 'onComplete'} = validation ?? {};
  const [retriesLeft, setRetriesLeft] = React.useState(maxRetries ?? Infinity);
  const shakeAnimation = useMemo(() => new Animated.Value(0), []);
  const colorShiftAnimation = useMemo(() => new Animated.Value(0), []);
  const hideKeyboard = useCallback(() => inputRef.current?.blur(), [inputRef]);
  const showKeyboard = useCallback(() => inputRef.current?.focus(), [inputRef]);
  const isComplete = useMemo(() => pin.length === length, [pin, length]);

  const triggerFailureAnimation = useCallback(() => {
    const {values, shakeDuration, colorShiftDuration} = failureAnimationConfig;
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
  }, [failureAnimationConfig]);

  useEffect(() => {
    if (isValid && isComplete) {
      hideKeyboardOnValidAndComplete && hideKeyboard();
      return;
    }
    if (!isComplete && triggerValidation === 'onComplete') {
      return;
    }
    if (!isValid) {
      triggerFailureAnimation();
      if (maxRetries) {
        onMaxRetriesExceeded?.();
        setRetriesLeft(retriesLeft => Math.max(retriesLeft - 1, 0));
      }
    }
  }, [isValid, isComplete, maxRetries, onMaxRetriesExceeded, triggerFailureAnimation, setRetriesLeft]);

  const onKeyPress = useCallback<NonNullable<TextInputProps['onKeyPress']>>(
    ({nativeEvent: {key}}) => {
      const isBackspaceKey = key === 'Backspace';
      const isNumberKey = ONLY_ALLOW_NUMBERS_REGEX.test(key);
      if (isBackspaceKey) {
        onPinChange(pin.slice(0, -1));
        return;
      }
      const newPin = isNumberKey ? pin + key : pin;
      if (triggerValidation === 'onKeyPress') {
        isValid && !isComplete && onPinChange(newPin);
      } else {
        !isComplete && onPinChange(newPin);
      }
    },
    [pin, onPinChange, isComplete, isValid],
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onHide = () => {
      if (inputRef?.current && inputRef?.current?.isFocused()) inputRef.current.blur();
    };
    Keyboard.addListener('keyboardDidHide', onHide);

    return () => Keyboard.removeAllListeners('keyboardDidHide');
  }, []);
  return (
    // TODO remove TouchableOpacity once we have a stable keyboard that does not hide
    <TouchableOpacity activeOpacity={1} onPress={showKeyboard}>
      <Container>
        <SegmentsContainer style={{left: shakeAnimation}}>
          {Array.from({length}).map((_, i) => {
            const value = pin.charAt(i);
            const iteration = i < pin.length - 1 ? 'previous' : i > pin.length ? 'upcoming' : 'current';
            const valueMap = {
              previous: secureCode ? '*' : value,
              current: value,
              upcoming: '',
            };
            return <OnboardingPinCodeSegment key={i} value={valueMap[iteration]} isCurrent={iteration === 'current'} />;
          })}
        </SegmentsContainer>
        {maxRetries && <AttemptsLeftText>{`${translate('pin_code_attempts_left_message')} ${retriesLeft}`}</AttemptsLeftText>}
        <TextInput
          ref={inputRef}
          style={{display: 'none'}}
          autoFocus
          accessible
          accessibilityRole={'text'}
          keyboardType="numeric"
          caretHidden
          value={pin}
          maxLength={length}
          onKeyPress={onKeyPress}
          {...textInputProps}
        />
      </Container>
    </TouchableOpacity>
  );
};

export default OnboardingPinCode;
