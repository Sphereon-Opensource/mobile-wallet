import React, {useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {PIN_CODE_LENGTH} from '../../../@config/constants';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import PinCode from '../../../components/pinCodes/OnboardingPinCode';
import {useHasStrongBiometrics} from '../../../hooks/use-biometrics';
import {useAccessibility} from '../../../hooks/useAccessibility';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {SSITextH3RegularLightStyled} from '../../../styles/components';
import {OnboardingBiometricsStatus, OnboardingMachineEvents} from '../../../types/machines/onboarding';

const VerifyPinCodeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {announce} = useAccessibility();
  useHasStrongBiometrics({
    onBiometricsConfirmed: (isSecure: boolean) => {
      if (!isSecure)
        onboardingInstance.send({
          type: OnboardingMachineEvents.SET_BIOMETRICS,
          data: OnboardingBiometricsStatus.DISABLED,
        });
    },
  });
  const {
    context: {pinCode: pinCodeContext, verificationPinCode: verificationPinCodeContext},
  } = onboardingInstance.getSnapshot();
  const [pinCode, setPinCode] = useState('');
  const isComplete = useMemo(() => pinCode.length === PIN_CODE_LENGTH, [pinCode]);
  const translationsPath = 'onboarding_pages.verify_pin';

  const doPinsCompletelyMatch = useMemo(() => pinCode === pinCodeContext, [pinCode, pinCodeContext]);

  useEffect(() => {
    if (isComplete && doPinsCompletelyMatch) {
      announce({message: 'Pin code verified successfully'});
      setTimeout(() => {
        onboardingInstance.send(OnboardingMachineEvents.SET_VERIFICATION_PIN_CODE, {data: pinCode});
        onboardingInstance.send(OnboardingMachineEvents.NEXT);
        setPinCode('');
      }, 500);
    } else if (!doPinsCompletelyMatch) {
      if (isComplete) {
        announce({message: translate(`${translationsPath}.mismatch`)});
        setPinCode('');
      }
    }
  }, [isComplete, doPinsCompletelyMatch]);

  return (
    <ScreenContainer>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} accessibilityFocusOnTitle />
      <View style={{marginBottom: 32, flex: 1, gap: 48}}>
        <PinCode
          pin={pinCode}
          onPinChange={setPinCode}
          length={PIN_CODE_LENGTH}
          validation={{
            isValid: doPinsCompletelyMatch,
          }}
        />
        <SSITextH3RegularLightStyled>
          {doPinsCompletelyMatch ? translate(`${translationsPath}.match`) : isComplete ? translate(`${translationsPath}.mismatch`) : ''}
        </SSITextH3RegularLightStyled>
      </View>
    </ScreenContainer>
  );
};

export default VerifyPinCodeScreen;
