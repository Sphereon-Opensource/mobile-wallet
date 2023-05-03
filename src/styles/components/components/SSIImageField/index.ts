import styled from 'styled-components/native';

import {backgrounds} from '../../../colors';
import {SSIFlexDirectionRowViewStyled} from '../../containers';

export const SSIImageFieldContainerStyled = styled.View`
  width: 100%;
  padding: 2px 24px 4px 0px;
`;

export const SSIImageFieldHeaderContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  padding-left: 24px;
`;

export const SSIImageFieldContentContainerStyled = styled.View`
  margin-left: 24px;
  padding: 10px;
  background-color: ${backgrounds.primaryDark};
  border-radius: 10px;
`;
