import {FC} from 'react';
import {ColorValue, View} from 'react-native';
import {StepContent} from '../../../types/component';
import StepIndicator from '../StepperStepIndicator';

export interface IProps {
  activeStep: number;
  content: StepContent[];
  ringColor: ColorValue;
}

const Stepper: FC<IProps> = ({activeStep, content, ringColor}) =>
  content.map(({render, accessibility}, index) => {
    const isLastStep = index === content.length - 1;
    const stepState = index === activeStep ? 'current' : index < activeStep ? 'finished' : 'upcoming';
    return (
      <View
        key={index}
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
        }}
        accessible={true}
        accessibilityLabel={accessibility?.getLabel(stepState, index, isLastStep)}>
        <StepIndicator isLastStep={isLastStep} state={stepState} stepIndex={index + 1} ringColor={ringColor} />
        <View style={{marginBottom: 32, flexShrink: 1}}>{render(stepState)}</View>
      </View>
    );
  });

export default Stepper;
