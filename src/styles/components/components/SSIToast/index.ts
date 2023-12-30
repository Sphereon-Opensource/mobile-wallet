import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled, SSIRoundedContainerStyled} from '../../containers';
import {SSITextH4DarkStyled} from '../../fonts';
import {alertColors} from '@sphereon/ui-components.core';

export const SSIToastContainerStyled = styled(SSIRoundedContainerStyled)`
  width: 96.8%;
  background-color: ${alertColors.secondaryLight};
  border-radius: 8px;
  justify-content: center;
  padding: 18px 18px 15px 18px;
`;

export const SSIToastBadgeContainerStyled = styled.View`
  margin-right: 10px;
  justify-content: center;
`;

export const SSIToastTitleContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 12px;
  width: 100%;
`;

export const SSIToastMessageCaptionStyled = styled(SSITextH4DarkStyled)`
  width: 100%;
`;
