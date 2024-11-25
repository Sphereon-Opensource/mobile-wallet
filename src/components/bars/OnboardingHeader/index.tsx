import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, useMemo, useState} from 'react';
import {Dimensions, Pressable} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import ProgressBarIndicator from '../../../components/indicators/ProgressBarIndicator';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {PIDSecurityModel, storagePersistPIDSecurityModel} from '../../../services/storageService';
import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarBackIconContainerStyled as BackIconContainer,
  Circle,
  OnboardingHeaderContainerStyled as Container,
  SSITextH1LightStyled as HeaderCaption,
  OnboardingHeaderRow as HeaderRow,
  SSIHeaderBarHeaderSubCaptionStyled as HeaderSubCaption,
  PROGRESS_BAR_HEIGHT,
  SSITextH3LightStyled,
  SSITextH3RegularLightStyled,
  SelectedCircle,
} from '../../../styles/components';
import {ButtonIconsEnum} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {capitalize} from '../../../utils';
import SSICloseIcon from '../../assets/icons/SSICloseIcon';
import SettingsIcon from '../../assets/icons/SettingsIcon';

const {width, height} = Dimensions.get('window');

const MODAL_WIDTH = width;
const MODAL_HEIGHT = (2 * height) / 3;

export interface HeaderBarProps extends NativeStackHeaderProps {
  title?: string;
  stepConfig?: {
    total: number;
    current: number;
  };
  headerSubTitle?: string;
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

const OnboardingHeader: FC<HeaderBarProps> = ({title, stepConfig, onBack, headerSubTitle, options}: HeaderBarProps): JSX.Element => {
  const {onboardingInstance} = React.useContext(OnboardingContext);

  const {currentStep, skipImport} = useMemo(
    () => (onboardingInstance ? onboardingInstance.getSnapshot().context : {currentStep: undefined, skipImport: undefined}),
    [onboardingInstance],
  );

  const showCogWheel = useMemo(() => {
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

  const onClose = async (): Promise<void> => {
    storagePersistPIDSecurityModel(securityModel)
      .then((): void => {
        if (securityModel === PIDSecurityModel.EID_DURING_PRESENTATION) {
          onboardingInstance.send(OnboardingMachineEvents.SET_SKIP_IMPORT, {data: true});
        }

        if (securityModel === PIDSecurityModel.SECURE_ELEMENT) {
          onboardingInstance.send(OnboardingMachineEvents.SET_SKIP_IMPORT, {data: false});
        }

        closeModal();
      })
      .catch(error => console.log(`Failed to persist PID security model. Error: ${error.message}`));
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
      {options.headerTitle && <HeaderCaption style={{marginBottom: 10}}>{options.headerTitle as string}</HeaderCaption>}
      {headerSubTitle && <HeaderSubCaption>{headerSubTitle}</HeaderSubCaption>}
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

            <PrimaryButton caption={translate('onboarding_pid_security_model_select')} onPress={() => onClose()} />
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
