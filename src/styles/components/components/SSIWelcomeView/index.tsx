import styled from 'styled-components/native';

import {SSITextH1LightStyled, SSITextH2LightStyled} from '../../fonts';
import {backgroundColors, borderColors} from '@sphereon/ui-components.core';

export const SSIWelcomeViewContainerStyled = styled.View`
  border-top-width: 1px;
  border-top-color: ${borderColors.dark};
  background-color: ${backgroundColors.primaryDark};
  width: 100%;
  padding-left: 24px;
  padding-right: 24px;
`;

export const SSIWelcomeViewHeaderTextStyled = styled(SSITextH2LightStyled)`
  margin-bottom: 4px;
`;

export const SSIWelcomeViewTitleTextStyled = styled(SSITextH1LightStyled)`
  margin-bottom: 6px;
`;

export const SSIWelcomeViewContentContainerStyled = styled.View`
  margin: 0 0 14px 0;
`;

export const SSIWelcomeViewBodyContainerStyled = styled.View`
  min-height: 170px;
`;

export const SSIWelcomeViewProgressIndicatorContainerStyled = styled.View`
  align-items: center;
  padding: 14px 0 12px 0;
`;
