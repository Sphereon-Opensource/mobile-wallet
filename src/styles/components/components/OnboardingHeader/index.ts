import styled from 'styled-components/native';
import {SSIBackgroundPrimaryDarkColorCss} from '../../css';

export const OnboardingHeaderContainerStyled = styled.View`
  ${SSIBackgroundPrimaryDarkColorCss};
  padding-horizontal: 24px;
`;

export const OnboardingHeaderRow = styled.View`
  flex-direction: row;
  margin-top: 12px;
  min-height: 42px;
  gap: 8px;
`;
