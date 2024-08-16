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
import {SSITextH3RegularLightStyled} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

const VerifyPinCodeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {
    context: {pinCode: pinCodeContext, verificationPinCode: verificationPinCodeContext},
  } = onboardingInstance.getSnapshot();
  const [pinCode, setPinCode] = useState(verificationPinCodeContext);
  const isComplete = useMemo(() => pinCode.length === PIN_CODE_LENGTH, [pinCode]);
  const translationsPath = 'onboarding_pages.verify_pin';

  const doPinsCompletelyMatch = useMemo(() => pinCode === pinCodeContext, [pinCode, pinCodeContext]);

  return (
    <ScreenContainer>
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
    </ScreenContainer>
  );
};

export default VerifyPinCodeScreen;
