import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {ReactNode, useEffect, useState} from 'react';
import {Dimensions, View, ViewStyle} from 'react-native';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';
import SSICloseIcon from '../../components/assets/icons/SSICloseIcon';
import ScreenTitleAndDescription from '../../components/containers/ScreenTitleAndDescription';
import SelectOption from '../../components/fields/SelectOption';
import {useAccessibility} from '../../hooks/useAccessibility';
import {translate} from '../../localization/Localization';
import {OnboardingContext} from '../../navigation/machines/onboardingStateNavigation';
import {PIDSecurityModel, storageGetPIDSecurityModel, storagePersistPIDSecurityModel} from '../../services/storageService';
import {OnboardingMachineEvents} from '../../types/machines/onboarding';

const {width, height} = Dimensions.get('window');

const MODAL_WIDTH = width;
export const MODAL_HEIGHT = (2 * height) / 3;

type Props = {
  onModalClose: (securityModel: PIDSecurityModel) => void;
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

export const Wrapper = ({children, onClose, style = {}}: {children: ReactNode; onClose: () => void; style?: ViewStyle}) => {
  const {isScreenReaderEnabled, setFocus} = useAccessibility();
  const containerRef = React.useRef<View>(null);
  useEffect(() => {
    setFocus(containerRef);
  }, [setFocus]);
  return isScreenReaderEnabled ? (
    <View
      ref={containerRef}
      accessibilityLabel="PID security model selection menu"
      accessibilityActions={[{name: 'close', label: 'Close menu'}]}
      onAccessibilityAction={event => {
        if (event.nativeEvent.actionName === 'close') {
          onClose();
        }
      }}
      style={[
        {
          width: MODAL_WIDTH,
          height: height - 42,
          position: 'static',
          marginLeft: -24,
        },
        style,
      ]}>
      {children}
    </View>
  ) : (
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
      {children}
    </Animated.View>
  );
};

const OnboardingSettingsModal = ({style, onModalClose}: Props) => {
  const {onboardingInstance} = React.useContext(OnboardingContext);
  const {isScreenReaderEnabled, announce} = useAccessibility();
  const [securityModel, setSecurityModel] = useState<PIDSecurityModel>(PIDSecurityModel.SECURE_ELEMENT);
  const onClose = async (): Promise<void> => {
    storagePersistPIDSecurityModel(securityModel)
      .then((): void => {
        const currentState = onboardingInstance.getSnapshot();
        if (securityModel !== currentState.context.pidSecurityModel) {
          onboardingInstance.send({
            type: OnboardingMachineEvents.UPDATE_SECURITY_MODEL,
            model: securityModel,
          });
        }
        announce({message: `Selected security model: ${securityModel}`});
        setTimeout(() => onModalClose(securityModel), isScreenReaderEnabled ? 3000 : 0);
      })
      .catch(error => console.log(`Failed to persist PID security model. Error: ${error.message}`));
  };

  useEffect(() => {
    const loadStoredModel = async () => {
      try {
        const storedModel = await storageGetPIDSecurityModel();
        if (storedModel) {
          setSecurityModel(storedModel);
        }
      } catch (error) {
        console.log(`Failed to load PID security model. Error: ${(error as Error).message}`);
      }
    };
    void loadStoredModel();
  }, []);

  return (
    <Wrapper onClose={onClose} style={!isScreenReaderEnabled ? style : undefined}>
      <SettingsModalContainer>
        <SettingsCloseContainer
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          style={({pressed}) => ({opacity: pressed ? 0.7 : 1, padding: 8})}>
          <SSICloseIcon color="white" size={15} />
        </SettingsCloseContainer>
        <ScreenTitleAndDescription
          title={translate('onboarding_pid_security_model_title')}
          description={translate('onboarding_pid_security_model_subtitle')}
          containerStyle={{marginTop: 8}}
        />
        <OptionContainer accessibilityRole="radiogroup" accessibilityLabel="Security model options">
          <SelectOption
            label={translate('onboarding_pid_security_model_secure_element')}
            onPress={() => setSecurityModel(PIDSecurityModel.SECURE_ELEMENT)}
            selected={securityModel === PIDSecurityModel.SECURE_ELEMENT}
          />
          <SelectOption
            label={translate('onboarding_pid_security_model_remote_hardware')}
            onPress={() => setSecurityModel(PIDSecurityModel.REMOTE_HSM)}
            selected={securityModel === PIDSecurityModel.REMOTE_HSM}
          />
          <SelectOption
            label={translate('onboarding_pid_security_model_mobile_operator')}
            onPress={() => setSecurityModel(PIDSecurityModel.MOBILE_OPERATOR_ESIM)}
            selected={securityModel === PIDSecurityModel.MOBILE_OPERATOR_ESIM}
          />
          <SelectOption
            label={translate('onboarding_pid_security_model_eid_presentation')}
            onPress={() => setSecurityModel(PIDSecurityModel.EID_DURING_PRESENTATION)}
            selected={securityModel === PIDSecurityModel.EID_DURING_PRESENTATION}
          />
        </OptionContainer>

        <PrimaryButton
          accessibilityRole="button"
          accessibilityLabel="Select security model and close menu"
          caption={translate('onboarding_pid_security_model_select')}
          onPress={onClose}
        />
      </SettingsModalContainer>
    </Wrapper>
  );
};

export default OnboardingSettingsModal;
