import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useMemo} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PROGRESS_BAR_VERTICAL_MARGIN} from '.';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingHeaderContainerStyled as Container, SSITextH3LightStyled} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import ProgressBarIndicator from '../../indicators/ProgressBarIndicator';
import {HeaderSecondaryBarRow} from '../HeaderSecondaryBar/Row';
import {Back, CenterInfo} from '../components';

export type Props = NativeStackHeaderProps & {
  title: string;
  subtitle?: string;
  stepConfig: {
    total: number;
    current: number;
  };
  onBack?: () => Promise<void>;
};

const OnboardingStepHeader: FC<Props> = ({title, subtitle, stepConfig, onBack}: Props): JSX.Element => {
  const {onboardingInstance} = React.useContext(OnboardingContext);
  const Left = useMemo(
    () => (
      <Back
        onPress={onBack ?? (() => onboardingInstance.send(OnboardingMachineEvents.PREVIOUS))}
        accessibilityHint="Navigate back to the previous screen"
      />
    ),
    [onBack, onboardingInstance],
  );

  const Center = useMemo(() => <CenterInfo title={title} subtitle={subtitle} />, [title, subtitle]);

  const Right = useMemo(
    () => (
      <SSITextH3LightStyled accessibilityLabel={`Step ${stepConfig.current} of ${stepConfig.total}`}>
        {`${stepConfig.current}/${stepConfig.total}`}
      </SSITextH3LightStyled>
    ),
    [stepConfig],
  );

  return (
    <Container style={{paddingTop: useSafeAreaInsets().top}}>
      <HeaderSecondaryBarRow left={Left} center={Center} right={Right} />
      <ProgressBarIndicator
        step={stepConfig.current}
        stepsNumber={stepConfig.total}
        containerStyle={{marginVertical: PROGRESS_BAR_VERTICAL_MARGIN}}
      />
    </Container>
  );
};

export default OnboardingStepHeader;
