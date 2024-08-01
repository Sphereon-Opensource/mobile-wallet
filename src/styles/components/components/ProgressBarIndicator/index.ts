import styled, {css} from 'styled-components/native';
import {SSILinearGradientStyled} from '../../gradients';

export const ProgressBarIndicatorContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const BaseProgressBar = css`
  height: 4px;
  border-radius: 2px;
`;

export const BackgroundBar = styled.View`
  ${BaseProgressBar};
  flex: 1;
  position: relative;
  background-color: #404d7a;
`;

export const ForegroundBar = styled(SSILinearGradientStyled)`
  ${BaseProgressBar};
  position: absolute;
  top: 0;
  left: 0;
`;
