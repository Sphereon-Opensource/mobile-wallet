import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {useState} from 'react';
import {Dimensions, ViewStyle} from 'react-native';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';
import SSICloseIcon from '../../components/assets/icons/SSICloseIcon';
import ScreenTitleAndDescription from '../../components/containers/ScreenTitleAndDescription';
import SelectOption from '../../components/fields/SelectOption';
import {translate} from '../../localization/Localization';
import {OnboardingContext} from '../../navigation/machines/onboardingStateNavigation';
import {PIDSecurityModel, storagePersistPIDSecurityModel} from '../../services/storageService';
import {OnboardingMachineEvents} from '../../types/machines/onboarding';

const {width, height} = Dimensions.get('window');

const MODAL_WIDTH = width;
export const MODAL_HEIGHT = (2 * height) / 3;

type Props = {
  onModalClose: () => void;
  style: ViewStyle;
};

const SettingsModalContainer = styled.View`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;

  border-top-right-radius: 32px;
  border-top-left-radius: 32px;
  background-color: #2c334b;

  padding: 60px 36px 30px 24px;
  /* background: black; */
`;

const SettingsCloseContainer = styled.Pressable`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 36px;
  right: 36px;
`;

const OptionContainer = styled.View`
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 15px;
`;

const OnboardingSettingsModal = ({style, onModalClose}: Props) => {
  const {onboardingInstance} = React.useContext(OnboardingContext);
  const [securityModel, setSecurityModel] = useState<PIDSecurityModel>(PIDSecurityModel.SECURE_ELEMENT);
  const onClose = async (): Promise<void> => {
    storagePersistPIDSecurityModel(securityModel)
      .then((): void => {
        if (securityModel === PIDSecurityModel.EID_DURING_PRESENTATION) {
          onboardingInstance.send(OnboardingMachineEvents.SET_SKIP_IMPORT, {data: true});
        }
        if (securityModel === PIDSecurityModel.SECURE_ELEMENT) {
          onboardingInstance.send(OnboardingMachineEvents.SET_SKIP_IMPORT, {data: false});
        }
        onModalClose();
      })
      .catch(error => console.log(`Failed to persist PID security model. Error: ${error.message}`));
  };

  return (
    <Animated.View
      style={[
        {
          width: MODAL_WIDTH,
          height: MODAL_HEIGHT,
          position: 'absolute',
          left: 0,
          top: height - MODAL_HEIGHT,
        },
        style,
      ]}>
      <SettingsModalContainer>
        <SettingsCloseContainer onPress={onClose} style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
          <SSICloseIcon color="white" size={15} />
        </SettingsCloseContainer>
        <ScreenTitleAndDescription
          title={translate('onboarding_pid_security_model_title')}
          description={translate('onboarding_pid_security_model_subtitle')}
        />
        <OptionContainer>
          <SelectOption
            label={translate('onboarding_pid_security_model_secure_element')}
            onPress={() => setSecurityModel(PIDSecurityModel.SECURE_ELEMENT)}
            selected={securityModel === PIDSecurityModel.SECURE_ELEMENT}
          />
          <SelectOption
            label={translate('onboarding_pid_security_model_remote_hardware')}
            onPress={() => setSecurityModel(PIDSecurityModel.REMOTE_HSM)}
            selected={securityModel === PIDSecurityModel.REMOTE_HSM}
            disabled
          />
          <SelectOption
            label={translate('onboarding_pid_security_model_mobile_operator')}
            onPress={() => setSecurityModel(PIDSecurityModel.MOBILE_OPERATOR_ESIM)}
            selected={securityModel === PIDSecurityModel.MOBILE_OPERATOR_ESIM}
            disabled
          />
          <SelectOption
            label={translate('onboarding_pid_security_model_eid_presentation')}
            onPress={() => setSecurityModel(PIDSecurityModel.EID_DURING_PRESENTATION)}
            selected={securityModel === PIDSecurityModel.EID_DURING_PRESENTATION}
          />
        </OptionContainer>

        <PrimaryButton caption={translate('onboarding_pid_security_model_select')} onPress={onClose} />
      </SettingsModalContainer>
    </Animated.View>
  );
};

export default OnboardingSettingsModal;
