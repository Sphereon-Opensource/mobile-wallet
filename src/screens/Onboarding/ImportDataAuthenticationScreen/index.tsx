import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {TextInput} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import styled from 'styled-components/native';
import {PIN_CODE_LENGTH} from '../../../@config/constants';
import SSICloseIcon from '../../../components/assets/icons/SSICloseIcon';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import PinCode from '../../../components/pinCodes/OnboardingPinCode';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {storageGetPin} from '../../../services/storageService';
import {RootState} from '../../../types';
import {OnboardingBiometricsStatus, OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {IUserState} from '../../../types/store/user.types';
import {CircleWithBorder} from '../EnableBiometricsScreen/Circle';
import {useAuthEffect} from '../EnableBiometricsScreen/use-biometrics';

const Content = styled.View`
  flex: 1;
  background-color: ${backgroundColors.primaryDark};
  display: flex;
  align-items: center;
  padding: 20px;
  justify-content: center;
`;

const useBiometricsEnabledContext = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const userState: IUserState = useSelector((state: RootState) => state.user);

  const enabled = useMemo(() => {
    return onboardingInstance
      ? onboardingInstance.getSnapshot()?.context?.biometricsEnabled === OnboardingBiometricsStatus.ENABLED
      : userState.activeUser?.biometricsEnabled === OnboardingBiometricsStatus.ENABLED;
  }, [onboardingInstance, userState]);

  return enabled;
};

const ImportDataAuthenticationScreen = (props?: any) => {
  const {onAccept} = props?.route?.params ?? {};

  const {onboardingInstance} = useContext(OnboardingContext);

  const biometricsEnabled = useBiometricsEnabledContext();

  const [pinCode, setPinCode] = useState('');
  const [pinCodeContext, setPinCodeContext] = useState('');
  const doPinsCompletelyMatch = useMemo(() => pinCode === pinCodeContext, [pinCode, pinCodeContext]);
  const pinInputRef = useRef<TextInput>(null);

  const [failed, setFailed] = useState(false);

  useAuthEffect((success: boolean) => {
    if (!success) {
      if (pinInputRef.current) {
        pinInputRef.current.focus();
      }
      return setFailed(true);
    }

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

  const footer = !biometricsEnabled ? (
    <PrimaryButton
      style={{height: 42, width: 300}}
      caption="Next"
      backgroundColors={['#7276F7', '#7C40E8']}
      captionColor={fontColors.light}
      onPress={() => (onAccept ? onAccept() : onboardingInstance.send(OnboardingMachineEvents.NEXT))}
      disabled={biometricsEnabled ? undefined : !doPinsCompletelyMatch}
    />
  ) : null;

  const title = useMemo(() => {
    if (!biometricsEnabled) return translate('import_data_auth_title');
    if (failed) return translate('import_data_auth_failure_title');
    return translate('import_data_auth_biometrics_title');
  }, [biometricsEnabled, failed]);

  const description = useMemo(() => {
    if (!biometricsEnabled) return undefined;
    if (failed) return translate('import_data_auth_failure_description');
  }, [biometricsEnabled, failed]);

  return (
    <ScreenContainer footer={footer}>
      <ScreenTitleAndDescription title={title} description={description} />
      {(failed || biometricsEnabled) && (
        <Content style={{height: '100%'}}>
          <CircleWithBorder
            icon={failed ? <SSICloseIcon color="white" size={40} /> : undefined}
            size={200}
            backgroundColors={['#7276F799', '#7C40E899']}
            borderColors={['#7C40E899', '#7C40E866']}
            borderWidth={30}
          />
        </Content>
      )}
      {!biometricsEnabled && (
        <PinCode
          inputRef={pinInputRef}
          pin={pinCode}
          onPinChange={setPinCode}
          length={PIN_CODE_LENGTH}
          validation={{isValid: doPinsCompletelyMatch}}
        />
      )}
    </ScreenContainer>
  );
};

export default ImportDataAuthenticationScreen;
