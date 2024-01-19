import styled from 'styled-components/native';

import {SSITouchableOpacityButtonFlexRowStyled} from '../../buttons';
import {SSIFlexDirectionRowViewStyled, SSIRoundedContainerStyled} from '../../containers';
import {SSITextH4DarkStyled} from '../../fonts';
import {alertColors} from '@sphereon/ui-components.core';

export const SSIAlertContainerStyled = styled(SSIRoundedContainerStyled)`
  margin-bottom: 10px;
`;

export const SSIAlertMessageContainerStyled = styled.View`
  justify-content: center;
  align-items: center;
  background-color: ${alertColors.primaryLight};
  padding-left: 28px;
  padding-right: 28px;
`;

export const SSIAlertMessageTextStyled = styled(SSITextH4DarkStyled)`
  text-align: center;
  margin-top: 14px;
  margin-bottom: 17px;
  height: 31px;
`;

export const SSIAlertButtonContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  height: 48px;
  display: flex;
  flex-wrap: wrap;
  background-color: ${alertColors.secondaryLight};
`;

export const SSIAlertButtonStyled = styled(SSITouchableOpacityButtonFlexRowStyled)`
  background-color: ${alertColors.secondaryLight};
  flex: 1;
  height: 100%;
  justify-content: center;
  align-items: center;
`;
