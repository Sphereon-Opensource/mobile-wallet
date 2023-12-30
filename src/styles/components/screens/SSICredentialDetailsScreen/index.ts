import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {backgroundColors} from '@sphereon/ui-components.core';

export const SSICredentialDetailsScreenContentContainer = styled.View`
  width: 100%;
  flex: 1;
`;

export const SSICredentialDetailsScreenCredentialCardContainer = styled.View`
  align-items: center;
  margin-bottom: 8px;
`;

export const SSICredentialDetailsScreenButtonContainer = styled.View`
  height: 80px;
  width: 100%;
  margin-top: auto;
  background-color: ${backgroundColors.secondaryDark};
`;

export const SSICredentialDetailsScreenButtonContentContainer = styled(SSIFlexDirectionRowViewStyled)`
  margin: auto auto;
  justify-content: space-between;
  padding: 0 24px;
`;
