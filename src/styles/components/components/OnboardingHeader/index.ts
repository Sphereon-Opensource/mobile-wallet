import styled from 'styled-components/native';
import {SSIBackgroundPrimaryDarkColorCss} from '../../css';

export const OnboardingHeaderContainerStyled = styled.View`
  ${SSIBackgroundPrimaryDarkColorCss};
  padding-left: 24px;
  padding-right: 24px;
`;

export const OnboardingHeaderRow = styled.View`
  flex-direction: row;
  margin-top: 12px;
  min-height: 42px;
  gap: 8px;
  align-items: center;
`;
