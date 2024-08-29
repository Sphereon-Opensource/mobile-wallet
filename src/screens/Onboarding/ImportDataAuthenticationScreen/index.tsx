import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useEffect, useMemo, useState} from 'react';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import PinCode from '../../../components/pinCodes/OnboardingPinCode';
import {PIN_CODE_LENGTH} from '../../../@config/constants';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import {useAuthEffect} from '../EnableBiometricsScreen/use-biometrics';
import {storageGetPin} from '../../../services/storageService';

const ImportDataAuthenticationScreen = (props?: any) => {
  const {onAccept} = props?.route?.params ?? {};

  const {onboardingInstance} = useContext(OnboardingContext);
  // const {
  //   context: {pinCode: pinCodeContext},
  // } = onboardingInstance.getSnapshot();
  const [pinCode, setPinCode] = useState('');
  const [pinCodeContext, setPinCodeContext] = useState('');
  const doPinsCompletelyMatch = useMemo(() => pinCode === pinCodeContext, [pinCode, pinCodeContext]);

  useAuthEffect((success: boolean) => {
    if (!success) return;

    onAccept ? onAccept() : onboardingInstance.send(OnboardingMachineEvents.NEXT);
  });

  useEffect(() => {
    if (onAccept) {
      storageGetPin().then(pin => setPinCodeContext(pin));
    } else {
      const {
        context: {pinCode: pinCodeContext},
      } = onboardingInstance.getSnapshot();
      setPinCodeContext(pinCodeContext);
    }
  }, []);

  const footer = (
    <PrimaryButton
      style={{height: 42, width: 300}}
      caption="Next"
      backgroundColors={['#7276F7', '#7C40E8']}
      captionColor={fontColors.light}
      onPress={() => (onAccept ? onAccept() : onboardingInstance.send(OnboardingMachineEvents.NEXT))}
      disabled={!doPinsCompletelyMatch}
    />
  );

  return (
    <ScreenContainer footer={footer}>
      <ScreenTitleAndDescription title={translate('import_data_auth_title')} />
      <PinCode pin={pinCode} onPinChange={setPinCode} length={PIN_CODE_LENGTH} validation={{isValid: doPinsCompletelyMatch}} />
    </ScreenContainer>
  );
};

export default ImportDataAuthenticationScreen;
