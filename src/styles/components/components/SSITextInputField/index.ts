import styled from 'styled-components/native';

import {SSILinearGradientStyled} from '../../gradients';
import {TextInputStyled} from '../../text';

export const SSITextInputFieldContainerStyled = styled.View`
  width: 100%;
`;

export const SSITextInputFieldTextInputStyled = styled(TextInputStyled)`
  flex: 1;
`;

export const SSITextInputFieldIconContainerStyled = styled.View`
  margin-left: auto;
  padding-left: 10px;
  justify-content: center;
`;

export const SSITextInputFieldUnderlineStyled = styled.View`
  width: 100%;
  margin-bottom: 4px;
`;

export const SSITextInputFieldUnderlineLinearGradientStyled = styled(SSILinearGradientStyled)`
  height: 1px;
  width: 100%;
  margin-bottom: 4px;
`;

export const SSITextInputFieldHelperContainerStyled = styled.View`
  min-height: 15px;
`;
