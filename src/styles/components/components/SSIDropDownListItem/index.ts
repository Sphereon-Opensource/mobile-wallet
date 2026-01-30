import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSITextH2Styled} from '../../fonts';
import {backgroundColors} from '@sphereon/ui-components.core';

export const SSIDropDownListItemContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  flex: 1;
  background-color: transparent;
  align-items: center;
`;

export const SSIDropDownListItemCaptionContainerStyled = styled(SSITextH2Styled)`
  margin: 14px 0 14px 18px;
  font-size: 15px;
`;

export const SSIDropDownListItemIconContainerStyled = styled.View`
  width: 36px;
  margin-left: auto;
  margin-right: 14px;
  align-items: center;
  justify-content: center;
`;
