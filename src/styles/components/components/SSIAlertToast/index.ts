import styled from 'styled-components/native';

import ErrorIcon from '../../../../components/assets/badges/SSIExclamationMarkBadge';
import {alerts} from '../../../colors';
import {SSIRoundedContainerStyled} from '../../containers';
import {SSITextH4DarkStyled} from '../../fonts';

export const SSIAlertToastErrorIconStyled = styled(ErrorIcon).attrs({
  size: 13,
})`
  margin-top: 1px;
`;

export const SSIAlertToastContainerStyled = styled(SSIRoundedContainerStyled)`
  width: 96.8%;
  background-color: ${alerts.secondaryLight};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  padding: 18px 18px 15px 18px;
  flex-direction: row;
`;

export const SSIAlertToastIconContainerStyled = styled.View`
  height: 100%;
  margin-left: 0px;
  margin-right: 5px;
`;

export const SSIAlertToastMessageTextStyled = styled(SSITextH4DarkStyled)`
  text-align: center;
  height: 100%;
`;
