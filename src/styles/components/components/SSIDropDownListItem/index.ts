import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSITextH2Styled} from '../../fonts';
import {backgroundColors} from '@sphereon/ui-components.core';

export const SSIDropDownListItemContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  flex: 1;
  background-color: ${backgroundColors.primaryLight};
`;

export const SSIDropDownListItemCaptionContainerStyled = styled(SSITextH2Styled)`
  margin: 13px 0 11px 16px;
`;

export const SSIDropDownListItemIconContainerStyled = styled.View`
  width: 42px;
  margin: 4px 6px 2px auto;
  align-items: center;
  justify-content: center;
`;
