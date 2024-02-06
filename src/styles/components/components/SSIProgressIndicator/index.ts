import styled from 'styled-components/native';
import {SSILinearGradientSecondaryStyled} from '../../gradients';
import {backgroundColors} from '@sphereon/ui-components.core';

export const SSIProgressIndicatorSegment = styled.View`
  border-radius: 3px;
  height: 4px;
  width: 34px;
  background-color: ${backgroundColors.primaryLight};
`;

export const SSIProgressIndicatorLinearGradientSegment = styled(SSILinearGradientSecondaryStyled)`
  border-radius: 3px;
  height: 4px;
  width: 34px;
`;
