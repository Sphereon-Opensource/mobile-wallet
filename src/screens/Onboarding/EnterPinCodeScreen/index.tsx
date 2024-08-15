import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useCallback, useContext, useState} from 'react';
import {ScrollView} from 'react-native';
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

const validatePin = (pin: string, validators: Validator<number>[]): ValidationResult<number> => {
  const {isValid: hasCorrectLength} = validate(pin, [isStringOfLength(PIN_CODE_LENGTH)()]);
  const {isValid: isValidNumber, error} = validate(Number(pin), validators);
  return {isValid: hasCorrectLength && isValidNumber, error};
};

const EnterPinCodeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {
    context: {pinCode: pinCodeContext},
  } = onboardingInstance.getSnapshot();
  const translationsPath = 'onboarding_pages.enter_pin';
  const pinValueValidators = [
    isNotSameDigits(translate(`${translationsPath}.requirements.not_same_digits`)),
    isNotSequentialDigits(translate(`${translationsPath}.requirements.not_sequential_digits`)),
  ];
  const [isPinValid, setIsPinValid] = useState(validatePin(pinCodeContext, []).isValid);
  const [pinCode, setPinCode] = useState(pinCodeContext);
  const [erroniousValidator, setErroniousValidator] = useState<ValidatorType>();
  const [showFeedback, setShowFeedback] = useState(false);

  const onPinChange = useCallback(
    (pin: string) => {
      const {isValid, error} = validatePin(pin, pinValueValidators);
      const isComplete = pin.length === PIN_CODE_LENGTH;
      setShowFeedback(isComplete);
      setIsPinValid(isValid);
      setErroniousValidator(error?.validator);
      setPinCode(pin);
    },
    [onboardingInstance, isPinValid],
  );

  return (
    <ScreenContainer>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} />
      <ScrollView style={{marginBottom: 32, flex: 1}} showsVerticalScrollIndicator={false}>
        <PinCode pin={pinCode} onPinChange={onPinChange} length={PIN_CODE_LENGTH} validation={{isValid: isPinValid}} />
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
      </ScrollView>
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption={translate(`${translationsPath}.button_caption`)}
        disabled={!isPinValid}
        captionColor={fontColors.light}
        onPress={() => {
          const pinUpdated = pinCode !== pinCodeContext;
          if (pinUpdated) {
            onboardingInstance.send(OnboardingMachineEvents.SET_PIN_CODE, {data: pinCode});
          }
          onboardingInstance.send(OnboardingMachineEvents.NEXT);
        }}
      />
    </ScreenContainer>
  );
};

export default EnterPinCodeScreen;
