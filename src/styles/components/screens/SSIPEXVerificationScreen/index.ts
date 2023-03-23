import styled from 'styled-components/native';

import {SSITextH4LightStyled} from '../../fonts';

export const SSIPEXVerificationScreenBackgroundImageContainerStyled = styled.View`
  margin-top: 150px;
`;

export const SSIPEXVerificationScreenMessageContainerStyled = styled.View`
  margin-top: 20px;
  justify-content: center;
  align-items: center;
  margin-horizontal: 46px;
`;

export const SSIPEXVerificationScreenMessageStyled = styled(SSITextH4LightStyled)`
  flex: 1;
  flex-shrink: 1;
  flex-wrap: wrap;
  text-align: center;
`;

export const SSIPEXVerificationScreenMessageTitleStyled = styled(SSITextH4LightStyled)`
  margin-top: 40px;
`;
