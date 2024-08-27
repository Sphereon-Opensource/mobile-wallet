import styled from 'styled-components/native';
import {backgroundColors} from '@sphereon/ui-components.core';
import {SSITextH7LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {SSILinearGradientStyled} from '../../gradients';

export const FilterBarContainerStyled = styled.View`
  flex-direction: row;
  gap: 12px;
`;

export const FilterBarActiveLabelStyled = styled(SSILinearGradientStyled)`
  padding: 4px 12px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

export const FilterBarInactiveLabelStyled = styled.View`
  padding: 4px 12px;
  background-color: ${backgroundColors.secondaryDark};
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

export const FilterBarActiveLabelTextStyled = styled(SSITextH7LightStyled)`
  color: ${backgroundColors.primaryDark};
`;
