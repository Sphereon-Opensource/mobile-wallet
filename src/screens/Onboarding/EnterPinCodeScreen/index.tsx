import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {Dimensions, ScrollView, View, TextInput} from 'react-native';
import {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {PIN_CODE_LENGTH} from '../../../@config/constants';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import PinCode from '../../../components/pinCodes/OnboardingPinCode';
import PinCodeRequirements from '../../../components/pinCodes/PinCodeRequirement';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {SSITextH3RegularLightStyled} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {
  ValidationResult,
  Validator,
  ValidatorType,
  isNotSameDigits,
  isNotSequentialDigits,
  isStringOfLength,
  validate,
} from '../../../utils/validate';
import {useNavigation} from '@react-navigation/native';

const validatePin = (pin: string, validators: Validator<number>[]): ValidationResult<number> => {
  const {isValid: hasCorrectLength} = validate(pin, [isStringOfLength(PIN_CODE_LENGTH)()]);
  const {isValid: isValidNumber, error} = validate(Number(pin), validators);
  return {isValid: hasCorrectLength && isValidNumber, error};
};

const getInvalidPinExample = (length: number, prefix: string, delimiter: string): string => {
  const upSequence = Array.from({length}, (_, i) => i + 1).join('-');
  const downSequence = Array.from({length}, (_, i) => length - i).join('-');
  return `\n(${prefix}${upSequence}${delimiter}${downSequence})`;
};

const EnterPinCodeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    context: {pinCode: pinCodeContext},
  } = onboardingInstance.getSnapshot();
  const translationsPath = 'onboarding_pages.enter_pin';
  const invalidPinExample = useMemo(
    () =>
      getInvalidPinExample(
        PIN_CODE_LENGTH,
        translate(`${translationsPath}.requirements.invalid_example_prefix`),
        translate(`${translationsPath}.requirements.invalid_example_delimiter`),
      ),
    [],
  );
  const pinValueValidators = useMemo(
    () => [
      isNotSameDigits(`${PIN_CODE_LENGTH} ${translate(`${translationsPath}.requirements.not_same_digits`)}`),
      isNotSequentialDigits(`${translate(`${translationsPath}.requirements.not_sequential_digits`)}${invalidPinExample}`),
    ],
    [invalidPinExample],
  );
  const [isPinValid, setIsPinValid] = useState(validatePin(pinCodeContext, []).isValid);
  const [pinCode, setPinCode] = useState('');
  const [erroniousValidator, setErroniousValidator] = useState<ValidatorType>();
  const [showFeedback, setShowFeedback] = useState(false);

  const navigation = useNavigation();

  const PinCodeRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (PinCodeRef.current) {
      const unsubscribe = navigation.addListener('focus', () => {
        PinCodeRef.current?.focus();
      });
      return unsubscribe;
    }
  }, [navigation, PinCodeRef.current]);

  const onPinChange = useCallback(
    (pin: string) => {
      const {isValid, error} = validatePin(pin, pinValueValidators);
      const isComplete = pin.length === PIN_CODE_LENGTH;
      setShowFeedback(isComplete);
      setIsPinValid(isValid);
      setErroniousValidator(error?.validator);
      setPinCode(pin);
      if (!isValid && isComplete) {
        if (scrollViewRef) {
          scrollViewRef.current?.scrollTo(Dimensions.get('window').height);
        }
      }
    },
    [onboardingInstance, isPinValid, setShowFeedback, setIsPinValid, setErroniousValidator, setPinCode],
  );

  const footer = (
    <PrimaryButton
      style={{height: 42, width: '100%'}}
      caption={translate(`${translationsPath}.button_caption`)}
      disabled={!isPinValid}
      captionColor={fontColors.light}
      onPress={() => {
        const pinUpdated = pinCode !== pinCodeContext;
        if (pinUpdated) {
          onboardingInstance.send(OnboardingMachineEvents.SET_PIN_CODE, {data: pinCode});
          onboardingInstance.send(OnboardingMachineEvents.SET_VERIFICATION_PIN_CODE, {data: ''});
        }
        onboardingInstance.send(OnboardingMachineEvents.NEXT);
        setPinCode('');
      }}
    />
  );

  return (
    <ScreenContainer footer={footer} scrollViewRef={scrollViewRef}>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} />
      <View style={{marginBottom: 32, flex: 1}}>
        <PinCode inputRef={PinCodeRef} pin={pinCode} onPinChange={onPinChange} length={PIN_CODE_LENGTH} validation={{isValid: isPinValid}} />
        {!isPinValid ? (
          <PinCodeRequirements
            style={{marginTop: 48}}
            title={translate(`${translationsPath}.requirements.title`)}
            requirements={pinValueValidators.map(({key, errorMessage}) => ({
              key,
              text: errorMessage,
              met: erroniousValidator !== key,
              showFeedback,
            }))}
          />
        ) : (
          <SSITextH3RegularLightStyled style={{marginTop: 48}}>{translate(`${translationsPath}.success`)}</SSITextH3RegularLightStyled>
        )}
      </View>
    </ScreenContainer>
  );
};

export default EnterPinCodeScreen;
