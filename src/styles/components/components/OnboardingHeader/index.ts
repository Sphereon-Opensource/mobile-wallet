import styled from 'styled-components/native';
import {SSIBackgroundPrimaryDarkColorCss} from '../../css';

export const OnboardingHeaderContainerStyled = styled.View`
  ${SSIBackgroundPrimaryDarkColorCss};
  padding-horizontal: 24px;
`;

export const OnboardingHeaderRow = styled.View`
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  height: 42px;
  margin-top: 12px;
`;
