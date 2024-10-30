import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useMemo} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PROGRESS_BAR_VERTICAL_MARGIN} from '.';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {SSIHeaderBarBackIconStyled as BackIcon, OnboardingHeaderContainerStyled as Container, SSITextH3LightStyled} from '../../../styles/components';
import {ButtonIconsEnum} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import ProgressBarIndicator from '../../indicators/ProgressBarIndicator';
import {HeaderSecondaryBarRow} from '../HeaderSecondaryBar/Row';

export type Props = NativeStackHeaderProps & {
  title: string;
  stepConfig: {
    total: number;
    current: number;
  };
  onBack?: () => Promise<void>;
};

const OnboardingStepHeader: FC<Props> = ({title, stepConfig, onBack}: Props): JSX.Element => {
  const {onboardingInstance} = React.useContext(OnboardingContext);
  const Back = useMemo(
    () => (
      <BackIcon
        style={{marginTop: 0}}
        icon={ButtonIconsEnum.BACK}
        onPress={onBack ?? (() => onboardingInstance.send(OnboardingMachineEvents.PREVIOUS))}
      />
    ),
    [onBack, onboardingInstance],
  );

  const Center = useMemo(() => <SSITextH3LightStyled>{title}</SSITextH3LightStyled>, [title]);

  const Right = useMemo(() => <SSITextH3LightStyled>{`${stepConfig.current}/${stepConfig.total}`}</SSITextH3LightStyled>, [stepConfig]);

  return (
    <Container style={{paddingTop: useSafeAreaInsets().top}}>
      <HeaderSecondaryBarRow left={Back} center={Center} right={Right} />
      <ProgressBarIndicator
        step={stepConfig.current}
        stepsNumber={stepConfig.total}
        containerStyle={{marginVertical: PROGRESS_BAR_VERTICAL_MARGIN}}
      />
    </Container>
  );
};

export default OnboardingStepHeader;
