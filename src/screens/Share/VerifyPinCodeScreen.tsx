import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useMemo, useState} from 'react';
import {PIN_CODE_LENGTH} from '../../@config/constants';
import ScreenContainer from '../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../components/containers/ScreenTitleAndDescription';
import PinCode from '../../components/pinCodes/OnboardingPinCode';
import {translate} from '../../localization/Localization';
import {ShareContext} from '../../navigation/machines/shareStateNavigation';
import {ShareMachineEvents} from '../../types/machines/share';
import {useAuthEffect} from './UseBiometrics';

const VerifyPinCodeScreen = () => {
  const {shareInstance} = useContext(ShareContext);
  const {
    context: {verificationPinCode: pinCodeContext},
  } = shareInstance.getSnapshot();
  const [pinCode, setPinCode] = useState('');
  const doPinsCompletelyMatch = useMemo(() => pinCode === pinCodeContext, [pinCode, pinCodeContext]);

  useAuthEffect((success: boolean) => {
    if (!success) return;
    shareInstance.send(ShareMachineEvents.NEXT);
  });

  const footer = (
    <PrimaryButton
      style={{height: 42, width: 300}}
      caption="Next"
      backgroundColors={['#7276F7', '#7C40E8']}
      captionColor={fontColors.light}
      onPress={() => shareInstance.send(ShareMachineEvents.NEXT)}
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

export default VerifyPinCodeScreen;
