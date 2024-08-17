import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {ReactElement, useContext} from 'react';
import {View} from 'react-native';
import EID_card from '../../../assets/images/EID_card.svg';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import Stepper from '../../../components/steppers/Stepper';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {SSITextH2SemiBoldLightStyled, SSITextH3RegularLightStyled} from '../../../styles/components';
import {StepContent, StepState} from '../../../types';
import {OnboardingMachineEvents, OnboardingMachineStep} from '../../../types/machines/onboarding';

type BaseStepInformationProps = {
  title: string;
  description: string;
  Image?: ReactElement;
};

type StepInformationProps = BaseStepInformationProps & {
  stepState: StepState;
};

const fontColor: Record<StepState, string> = {
  current: '#FBFBFB',
  finished: '#FBFBFB',
  upcoming: fontColors.greyedOut,
};

const StepInformation = ({title, description, Image, stepState}: StepInformationProps) => {
  return (
    <View style={{gap: 8}}>
      <SSITextH2SemiBoldLightStyled
        style={{
          ...(stepState === 'finished' && {
            opacity: 0.8,
            marginTop: 2,
          }),
          color: fontColor[stepState],
        }}>
        {title}
      </SSITextH2SemiBoldLightStyled>
      {stepState !== 'finished' && <SSITextH3RegularLightStyled style={{color: fontColor[stepState]}}>{description}</SSITextH3RegularLightStyled>}
      {stepState === 'current' && Image}
    </View>
  );
};

const renderStepContent =
  ({title, description, Image}: BaseStepInformationProps) =>
  (stepState: StepState) =>
    <StepInformation title={title} description={description} Image={Image} stepState={stepState} />;

type ScreenText = {
  titleKey: string;
  descriptionKey?: string;
};

const screenTextKeys: Record<OnboardingMachineStep, ScreenText> = {
  [OnboardingMachineStep.CREATE_WALLET]: {
    titleKey: 'onboard_progress_pages.create_wallet.title',
    descriptionKey: 'onboard_progress_pages.create_wallet.description',
  },
  [OnboardingMachineStep.SECURE_WALLET]: {titleKey: 'onboard_progress_pages.secure_wallet.title'},
  [OnboardingMachineStep.IMPORT_PERSONAL_DATA]: {titleKey: 'onboard_progress_pages.import_personal_data.title'},
};

const ShowProgressScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {currentStep} = onboardingInstance.getSnapshot().context;
  const {titleKey, descriptionKey} = screenTextKeys[currentStep];
  const stepperContent: StepContent[] = [
    renderStepContent({
      title: translate('onboard_steps.create_wallet.title'),
      description: translate('onboard_steps.create_wallet.description'),
    }),
    renderStepContent({
      title: translate('onboard_steps.secure_wallet.title'),
      description: translate('onboard_steps.secure_wallet.description'),
    }),
    renderStepContent({
      title: translate('onboard_steps.import_personal_data.title'),
      // After the create wallet step, the description changes to a more specific one
      description:
        currentStep > OnboardingMachineStep.CREATE_WALLET
          ? translate('onboard_steps.import_personal_data.description.deutchland')
          : translate('onboard_steps.import_personal_data.description.default'),
      Image: (
        <View style={{marginTop: 24}}>
          <EID_card />
        </View>
      ),
    }),
  ];

  return (
    <ScreenContainer>
      <ScreenTitleAndDescription
        title={translate(titleKey)}
        description={descriptionKey && translate(descriptionKey)}
        titleVariant="h0"
        descriptionStyle={{opacity: 0.8}}
      />
      <View style={{marginBottom: 'auto'}}>
        <Stepper activeStep={currentStep - 1} content={stepperContent} ringColor={backgroundColors.primaryDark} />
      </View>
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption={translate('action_next_label')}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </ScreenContainer>
  );
};

export default ShowProgressScreen;
