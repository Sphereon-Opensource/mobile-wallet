import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import Stepper from '../../../components/steppers/Stepper';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {
  SSIBackgroundPrimaryDarkColorCss,
  SSITextH0LightStyled,
  SSITextH2LightStyled,
  SSITextH2SemiBoldLightStyled,
  SSITextH3RegularLightStyled,
} from '../../../styles/components';
import {ScreenRoutesEnum, StackParamList, StepContent, StepState} from '../../../types';
import {OnboardingMachineEvents, OnboardingMachineStep} from '../../../types/machines/onboarding';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.SHOW_PROGRESS>;

type BaseStepInformationProps = {
  title: string;
  description: string;
  image?: string;
};

type StepInformationProps = BaseStepInformationProps & {
  stepState: StepState;
};

const fontColor: Record<StepState, string> = {
  current: '#FBFBFB',
  finished: '#FBFBFB',
  upcoming: fontColors.greyedOut,
};

const NUMBER_OF_STEPS = 3;

const StepInformation = ({title, description, stepState}: StepInformationProps) => {
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
    </View>
  );
};

const renderStepContent =
  ({title, description, image}: BaseStepInformationProps) =>
  (stepState: StepState) =>
    <StepInformation title={title} description={description} image={image} stepState={stepState} />;

const Container = styled(View)`
  ${SSIBackgroundPrimaryDarkColorCss};
  flex: 1;
  padding: 10px 24px 36px;
`;

type ScreenText = {
  titleKey: string;
  descriptionKey?: string;
};

const screenTextKeys: Record<OnboardingMachineStep, ScreenText> = {
  1: {
    titleKey: 'onboard_progress_pages.step1.title',
    descriptionKey: 'onboard_progress_pages.step1.description',
  },
  2: {titleKey: 'onboard_progress_pages.step2.title'},
  3: {titleKey: 'onboard_progress_pages.step3.title'},
};

const ShowProgressScreen = (props: Props) => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {currentStep} = props.route.params.context;
  const {titleKey, descriptionKey} = screenTextKeys[currentStep];
  const stepperContent: StepContent[] = Array.from({length: NUMBER_OF_STEPS}).map((_, i) =>
    renderStepContent({
      title: translate(`onboard_steps.step${i + 1}.title`),
      description: translate(`onboard_steps.step${i + 1}.description`),
    }),
  );
  return (
    <Container>
      <SSITextH0LightStyled>{translate(titleKey)}</SSITextH0LightStyled>
      {descriptionKey && <SSITextH2LightStyled style={{opacity: 0.8, marginTop: 8}}>{translate(descriptionKey)}</SSITextH2LightStyled>}
      <View style={{marginTop: 32, marginBottom: 'auto'}}>
        <Stepper activeStep={currentStep - 1} content={stepperContent} ringColor={backgroundColors.primaryDark} />
      </View>
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption="Next"
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </Container>
  );
};

export default ShowProgressScreen;
