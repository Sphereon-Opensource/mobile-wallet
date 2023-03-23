import React, {FC} from 'react';

import {SSIProgressIndicatorLinearGradientSegment as LinearGradientSegment, SSIProgressIndicatorSegment as Segment} from '../../../styles/components';
import {SSIFlexDirectionRowViewStyled as Container} from '../../../styles/components';

const {v4: uuidv4} = require('uuid');

export interface IProps {
  step: number;
  maxSteps: number;
}

const SSIProgressIndicator: FC<IProps> = (props: IProps): JSX.Element => {
  const {step, maxSteps} = props;

  if (step > maxSteps) {
    throw new Error('step exceeds max steps');
  }

  const segments = [];
  for (let i = 1; i <= maxSteps; i++) {
    if (i === step) {
      segments.push(<LinearGradientSegment key={uuidv4()} style={{marginRight: i < maxSteps ? 16 : 0}} />);
    } else {
      segments.push(<Segment key={uuidv4()} style={{marginRight: i < maxSteps ? 16 : 0}} />);
    }
  }

  return <Container>{segments}</Container>;
};

export default SSIProgressIndicator;
