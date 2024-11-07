import {backgroundColors} from '@sphereon/ui-components.core';
import {styled} from 'styled-components/native';

export const QRPlaceholderViewContainer = styled.View`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const QRPlaceholderView = styled.View`
  width: 400px;
  height: 400px;
  border-radius: 5px;
  background-color: ${backgroundColors.secondaryDark};
`;
