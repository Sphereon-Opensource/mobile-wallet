import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useMemo, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProgressBarIndicator from '../../../components/indicators/ProgressBarIndicator';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarBackIconContainerStyled as BackIconContainer,
  OnboardingHeaderContainerStyled as Container,
  OnboardingHeaderRow as HeaderRow,
  PROGRESS_BAR_HEIGHT,
  SSITextH3LightStyled,
} from '../../../styles/components';
import {ButtonIconsEnum, ToastTypeEnum} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {Dimensions, Image, Pressable, Text, View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import styled from 'styled-components/native';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {SSITextH3RegularLightStyled} from '../../../styles/components';
import {Circle, SelectedCircle} from '../../../styles/components';
import {capitalize} from '../../../utils';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {PIDSecurityModel, storagePersistPIDSecurityModel} from '../../../services/storageService';
import SSICloseIcon from 'src/components/assets/icons/SSICloseIcon';
import SettingsIcon from 'src/components/assets/icons/SettingsIcon';

const {width, height} = Dimensions.get('window');

const MODAL_WIDTH = width;
const MODAL_HEIGHT = (2 * height) / 3;

export interface HeaderBarProps extends NativeStackHeaderProps {
  title?: string;
  stepConfig?: {
    total: number;
    current: number;
  };
  onBack?: () => Promise<void>;
}

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

const SettingsClose = styled.Image`
  height: 15px;
  width: 15px;
`;

const OptionContainer = styled.View`
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 15px;
`;

const PROGRESS_BAR_VERTICAL_MARGIN = 10;

export const PROGRESS_BAR_LAYOUT_HEIGHT = +PROGRESS_BAR_HEIGHT + PROGRESS_BAR_VERTICAL_MARGIN * 2;

const OnboardingHeader: FC<HeaderBarProps> = ({title, stepConfig, onBack}: HeaderBarProps): JSX.Element => {
  const {onboardingInstance} = React.useContext(OnboardingContext);

  const {currentStep, skipImport} = useMemo(
    () => (onboardingInstance ? onboardingInstance.getSnapshot().context : {currentStep: undefined, skipImport: undefined}),
    [onboardingInstance],
  );

  const showCogWheel = useMemo(() => {
    console.log('current step', currentStep);
    if (!currentStep) return false;
    return currentStep < 4 && !stepConfig;
  }, [currentStep]);

  const [isVisible, setIsVisible] = useState(false);
  const show = useSharedValue(false);

  const showModal = () => {
    setIsVisible(true);
    show.value = true;
  };

  const closeModal = () => {
    show.value = false;
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const [securityModel, setSecurityModel] = useState<PIDSecurityModel>(PIDSecurityModel.SECURE_ELEMENT);

  const modalStyle = useAnimatedStyle(() => {
    const translateY = withTiming(show.value ? 0 : MODAL_HEIGHT, {duration: 200, easing: Easing.ease});
    return {
      transform: [
        {
          translateY,
        },
      ],
    };
  });

  const onSelect = async () => {
    try {
      await storagePersistPIDSecurityModel(securityModel);
    } catch (e) {
      console.log('failed to persist PID security model');
    }
    if (securityModel === PIDSecurityModel.EID_DURING_PRESENTATION) {
      onboardingInstance.send(OnboardingMachineEvents.SET_SKIP_IMPORT, {data: true});
      closeModal();
      return;
    }
    if (skipImport) {
      onboardingInstance.send(OnboardingMachineEvents.SET_SKIP_IMPORT, {data: false});
    }
  };

  return (
    <Container style={{paddingTop: useSafeAreaInsets().top}}>
      <HeaderRow>
        <BackIconContainer style={{flex: 1}}>
          <BackIcon
            style={{marginTop: 0}}
            icon={ButtonIconsEnum.BACK}
            onPress={() => (onBack ? onBack() : onboardingInstance.send(OnboardingMachineEvents.PREVIOUS))}
          />
        </BackIconContainer>
        {title && <SSITextH3LightStyled>{title as string}</SSITextH3LightStyled>}
        {stepConfig && (
          <SSITextH3LightStyled
            style={{
              textAlign: 'right',
              flex: 1,
            }}>
            {`${stepConfig.current}/${stepConfig.total}`}
          </SSITextH3LightStyled>
        )}
        {showCogWheel && (
          <Pressable style={({pressed}) => ({opacity: pressed ? 0.7 : 1})} onPress={() => showModal()}>
            <SettingsIcon color="white" width={22} height={22} />
          </Pressable>
        )}
      </HeaderRow>
      {stepConfig && (
        <ProgressBarIndicator
          step={stepConfig.current}
          stepsNumber={stepConfig.total}
          containerStyle={{marginVertical: PROGRESS_BAR_VERTICAL_MARGIN}}
        />
      )}
      {isVisible && (
        <Animated.View
          style={[
            {
              width: MODAL_WIDTH,
              height: MODAL_HEIGHT,
              position: 'absolute',
              left: 0,
              top: height - MODAL_HEIGHT,
            },
            modalStyle,
          ]}>
          <SettingsModalContainer>
            <SettingsCloseContainer onPress={closeModal} style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
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

            <PrimaryButton caption={translate('onboarding_pid_security_model_select')} onPress={() => onSelect()} />
          </SettingsModalContainer>
        </Animated.View>
      )}
    </Container>
  );
};

type Props = {
  label: string;
  selected: boolean;
  onPress: (() => void) | (() => Promise<void>);
  disabled?: boolean;
};

const SelectOption = ({selected, onPress, label, disabled}: Props) => {
  const handlePress = () => {
    if (disabled) return;
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 5, opacity: disabled ? 0.7 : 1}}>
      {/* <Flag source={{uri: option.flagURI}} /> */}
      <SSITextH3RegularLightStyled>{capitalize(label)}</SSITextH3RegularLightStyled>
      <Circle>{selected && <SelectedCircle />}</Circle>
    </Pressable>
  );
};

// export default CountrySelectOption;

export default OnboardingHeader;
