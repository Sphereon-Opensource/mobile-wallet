import {backgroundColors} from '@sphereon/ui-components.core';
import {styled} from 'styled-components/native';

export const QRPresentationViewContainer = styled.View`
  flex: 1;
  display: flex;
  justify-content: start;
  align-items: center;
  background-color: ${backgroundColors.primaryDark};
  padding: 100px 10px;
`;

export const QRContainer = styled.View`
  padding: 10px;
  background-color: white;
`;
