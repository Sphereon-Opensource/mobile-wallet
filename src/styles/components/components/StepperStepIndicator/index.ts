import {LinearGradient} from 'expo-linear-gradient';
import styled, {css} from 'styled-components/native';

const dotBaseStyle = css`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const StepGradientDot = styled(LinearGradient).attrs(_ => ({
  colors: ['#4347E1', '#4C16AE'],
  start: {x: 0, y: 0},
  end: {x: 1, y: 1},
}))`
  ${dotBaseStyle}
`;

export const StepDotConnector = styled.View`
  background-color: #8d9099;
  width: 2px;
  flex: 1px;
`;

export const UpcomingStepDotConnectorPatch = styled.View`
  width: 2px;
  height: 2px;
  background-color: #8d9099;
`;

export const StepDotDefaultWrapper = styled.View`
  position: relative;
`;

export const CurrentStepRing = styled(StepDotDefaultWrapper)`
  width: 42px;r
  height: 42px;
  border-radius: 21px;
  background-color: transparent;
  border-color: #482fc8;
  border-width: 2px;
`;

export const StepperStepIndicatorContainer = styled.View`
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
`;

export const CurrentDot = styled(StepGradientDot)`
  width: 42px;
  height: 42px;
  border-radius: 21px;
  position: relative;
`;

export const FinishedDot = styled(StepGradientDot)`
  margin-horizontal: 4px;
`;

export const UpcomingDot = styled.View`
  ${dotBaseStyle};
  margin-horizontal: 4px;
  background-color: #8d9099;
`;

export const CurrentDotInnerRing = styled.View`
  width: 38px;
  height: 38px;
  border-radius: 20px;
  background-color: transparent;
  position: absolute;
  top: 2px;
  left: 2px;
  border-width: 2px;
`;
