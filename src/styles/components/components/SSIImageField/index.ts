import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {backgroundColors} from '@sphereon/ui-components.core';

export const SSIImageFieldContainerStyled = styled.View`
  flex: 0;
  padding: 2px 24px 4px 0;
`;

export const SSIImageFieldHeaderContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  padding-left: 24px;
`;

export const SSIImageFieldContentContainerStyled = styled.View`
  margin-left: 24px;
  padding: 10px;
  background-color: ${backgroundColors.primaryDark};
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`;
