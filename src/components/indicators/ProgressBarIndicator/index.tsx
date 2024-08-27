import {FC} from 'react';
import {ViewProps} from 'react-native';
import {BackgroundBar, ProgressBarIndicatorContainer as Container, ForegroundBar} from '../../../styles/components';

export interface IProps {
  step: number;
  stepsNumber: number;
  containerStyle?: ViewProps['style'];
}

const ProgressBarIndicator: FC<IProps> = ({step, stepsNumber, containerStyle}) => {
  return (
    <Container style={containerStyle}>
      <BackgroundBar>
        <ForegroundBar style={{width: `${(step / stepsNumber) * 100}%`}} />
      </BackgroundBar>
    </Container>
  );
};

export default ProgressBarIndicator;
