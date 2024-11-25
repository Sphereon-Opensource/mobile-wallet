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
    <Container
      accessibilityLabel={`Progress bar. Current progress: ${Math.round((step / stepsNumber) * 100)}%`}
      accessibilityRole="progressbar"
      style={containerStyle}>
      <BackgroundBar>
        <ForegroundBar style={{width: `${(step / stepsNumber) * 100}%`}} />
      </BackgroundBar>
    </Container>
  );
};

export default ProgressBarIndicator;
