import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {useContext, useMemo, useState} from 'react';
import {View} from 'react-native';
import {PIN_CODE_LENGTH} from '../../../@config/constants';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import PinCode from '../../../components/pinCodes/OnboardingPinCode';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingBiometricsStatus, OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {useHasStrongBiometrics} from '../EnableBiometricsScreen/use-biometrics';
import {SSITextH3RegularLightStyled} from '../../../styles/components';

const VerifyPinCodeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  console.log('verify screen:', onboardingInstance.getSnapshot().context.biometricsEnabled);
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
  const [pinCode, setPinCode] = useState(verificationPinCodeContext);
  const isComplete = useMemo(() => pinCode.length === PIN_CODE_LENGTH, [pinCode]);
  const translationsPath = 'onboarding_pages.verify_pin';

  const doPinsCompletelyMatch = useMemo(() => pinCode === pinCodeContext, [pinCode, pinCodeContext]);

  const footer = (
    <PrimaryButton
      style={{height: 42, width: '100%'}}
      caption={translate(`${translationsPath}.button_caption`)}
      disabled={!doPinsCompletelyMatch}
      captionColor={fontColors.light}
      onPress={() => {
        onboardingInstance.send(OnboardingMachineEvents.SET_VERIFICATION_PIN_CODE, {data: pinCode});
        onboardingInstance.send(OnboardingMachineEvents.NEXT);
      }}
    />
  );
  return (
    <ScreenContainer footer={footer}>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} />
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
