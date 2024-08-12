import {FC} from 'react';
import {ColorValue, Text} from 'react-native';
import {
  StepperStepIndicatorContainer as Container,
  CurrentDot,
  CurrentDotInnerRing,
  FinishedDot,
  StepDotConnector,
  UpcomingDot,
  UpcomingStepDotConnectorPatch,
} from '../../../styles/components';
import {IStepIndicatorProps, StepState} from '../../../types/component';
import SSICheckmarkIcon from '../../assets/icons/SSICheckmarkIcon';

type DotProps = {
  state: StepState;
  stepIndex: number;
  ringColor?: ColorValue;
};

const CurrentStepDot = ({ringColor, stepIndex}: DotProps) => (
  <CurrentDot>
    <CurrentDotInnerRing style={{borderColor: ringColor}} />
    <Text style={{color: 'white', fontSize: 16, fontWeight: '700'}}>{stepIndex}</Text>
  </CurrentDot>
);

const FinishedStepDot = () => (
  <FinishedDot>
    <SSICheckmarkIcon color="#FBFBFB" />
  </FinishedDot>
);

const UpcomingStepDot = ({stepIndex}: DotProps) => (
  <UpcomingDot>
    <Text style={{color: 'white', fontSize: 16, fontWeight: '700'}}>{stepIndex}</Text>
  </UpcomingDot>
);

const renderDot: Record<StepState, (dotProps: DotProps) => JSX.Element> = {
  current: (dotProps: DotProps) => <CurrentStepDot {...dotProps} />,
  upcoming: (dotProps: DotProps) => <UpcomingStepDot {...dotProps} />,
  finished: (_: DotProps) => <FinishedStepDot />,
};

const StepperStepIndicator: FC<IStepIndicatorProps> = ({state, isLastStep, stepIndex, ringColor}) => {
  return (
    <Container>
      {state === 'upcoming' && <UpcomingStepDotConnectorPatch />}
      {renderDot[state]({state, stepIndex, ringColor})}
      {!isLastStep && <StepDotConnector />}
    </Container>
  );
};

export default StepperStepIndicator;
