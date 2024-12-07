import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {ReactElement, useContext, useEffect} from 'react';
import {View} from 'react-native';
import EIDPinCardIcon from '../../../components/assets/icons/EIDPinCardIcon';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import Stepper from '../../../components/steppers/Stepper';
import {useAccessibility} from '../../../hooks/useAccessibility';
import {usePrevious} from '../../../hooks/usePrevious';
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
  accessibilityLabelKey?: string;
};

const screenTextKeys: Record<OnboardingMachineStep, ScreenText> = {
  [OnboardingMachineStep.CREATE_WALLET]: {
    titleKey: 'onboard_progress_pages.create_wallet.title',
    descriptionKey: 'onboard_progress_pages.create_wallet.description',
    accessibilityLabelKey: 'onboard_progress_pages.create_wallet.accessibility_label',
  },
  [OnboardingMachineStep.SECURE_WALLET]: {
    titleKey: 'onboard_progress_pages.secure_wallet.title',
    accessibilityLabelKey: 'onboard_progress_pages.secure_wallet.accessibility_label',
  },
  [OnboardingMachineStep.IMPORT_PERSONAL_DATA]: {
    titleKey: 'onboard_progress_pages.import_personal_data.title',
    accessibilityLabelKey: 'onboard_progress_pages.import_personal_data.accessibility_label',
  },
  [OnboardingMachineStep.FINAL]: {
    titleKey: 'import_data_setup_complete_title',
    accessibilityLabelKey: 'import_data_setup_complete_accessibility_label',
  },
};

const getImportDataDescription = (currentStep: OnboardingMachineStep, countryCode: string | undefined) =>
  currentStep > OnboardingMachineStep.CREATE_WALLET
    ? translate(`onboard_steps.import_personal_data.description.${countryCode?.toLowerCase()}`, {
        defaults: [
          {
            scope: 'onboard_steps.import_personal_data.description.default',
          },
        ],
      })
    : translate('onboard_steps.import_personal_data.description.default');

const NO_STEPS = 3;
const stepHintTemplate = (hint: string) => (stepState: StepState, current: number, isFinal: boolean) =>
  [
    translate('onboard_steps.accessibility_tokens.step'),
    current + 1,
    translate('onboard_steps.accessibility_tokens.of'),
    NO_STEPS,
    '.',
    stepState,
    isFinal ? translate('onboard_steps.accessibility_tokens.and_final') : '',
    translate('onboard_steps.accessibility_tokens.step'),
    '.',
    hint,
  ].join(' ');

const ShowProgressScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const {
    context: {popupMenuOpen},
  } = onboardingInstance.getSnapshot();
  const previousMenuStateOpen = usePrevious(popupMenuOpen);
  const {currentStep, countryCode} = onboardingInstance.getSnapshot().context;
  const {titleKey, descriptionKey, accessibilityLabelKey} = screenTextKeys[currentStep];
  const {announce} = useAccessibility();
  const stepperContent: StepContent[] = [
    {
      render: renderStepContent({
        title: translate('onboard_steps.create_wallet.title'),
        description: translate('onboard_steps.create_wallet.description'),
      }),
      accessibility: {
        getLabel: stepHintTemplate(`${translate('onboard_steps.create_wallet.title')}. ${translate('onboard_steps.create_wallet.description')} `),
        buttonHint: translate('onboard_steps.create_wallet.accessibility.button_hint'),
      },
    },
    {
      render: renderStepContent({
        title: translate('onboard_steps.secure_wallet.title'),
        description: translate('onboard_steps.secure_wallet.description'),
      }),
      accessibility: {
        getLabel: stepHintTemplate(`${translate('onboard_steps.secure_wallet.title')}. ${translate('onboard_steps.secure_wallet.description')} `),
        buttonHint: translate('onboard_steps.secure_wallet.accessibility.button_hint'),
      },
    },
    ...((!countryCode || countryCode === 'DE') ? [{
      render: renderStepContent({
        title: translate('onboard_steps.import_personal_data.title'),
        description: getImportDataDescription(currentStep, countryCode),
        Image: (
          <View style={{marginTop: 24}}>
            <EIDPinCardIcon />
          </View>
        ),
      }),
      accessibility: {
        getLabel: stepHintTemplate(
          `${translate('onboard_steps.import_personal_data.title')}. ${getImportDataDescription(currentStep, countryCode)} `,
        ),
        buttonHint: translate('onboard_steps.import_personal_data.accessibility.button_hint'),
      },
    }] : [])
  ];

  const footer = (
    <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12}}>
      <PrimaryButton
        caption={translate('action_next_label')}
        accessibilityRole="button"
        accessibilityHint={stepperContent[currentStep - 1]?.accessibility?.buttonHint}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
      {currentStep === 3 && (
        <SecondaryButton
          caption={translate('onboarding_skip_credential_import_step3_caption')}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.SKIP_IMPORT)}
        />
      )}
    </View>
  );
  useEffect(() => {
    if (previousMenuStateOpen) {
      announce({message: `Menu closed`, delay: 2000});
    } else {
      announce({message: 'Menu opened', delay: 2000});
    }
  }, [previousMenuStateOpen]);
  return (
    <ScreenContainer footer={footer} importantForAccessibility={popupMenuOpen ? 'no-hide-descendants' : 'yes'}>
      <ScreenTitleAndDescription
        title={(!countryCode || countryCode === 'DE') ? translate(titleKey) : translate('onboard_progress_pages.import_personal_data.title')} // FIXME quick fix to show a proper title if we skipping the import of the PID
        description={descriptionKey && translate(descriptionKey)}
        accessibilityLabel={accessibilityLabelKey && `${translate(accessibilityLabelKey)} ${currentStep} out of ${stepperContent.length} `}
        titleVariant="h0"
        descriptionStyle={{opacity: 0.8}}
        accessibilityFocusOnTitle
      />
      <View style={{marginBottom: 'auto'}}>
        <Stepper activeStep={currentStep - 1} content={stepperContent} ringColor={backgroundColors.primaryDark} />
      </View>
    </ScreenContainer>
  );
};

export default ShowProgressScreen;
