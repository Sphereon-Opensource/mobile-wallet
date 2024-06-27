import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {backgroundColors} from '@sphereon/ui-components.core';

export const CredentialDetailsScreenContentContainer = styled.View`
  width: 100%;
  flex: 1;
`;

export const CredentialDetailsScreenCredentialCardContainer = styled.View`
  align-items: center;
  margin-bottom: 8px;
`;

export const CredentialDetailsScreenButtonContainer = styled.View`
  height: 80px;
  width: 100%;
  margin-top: auto;
  background-color: ${backgroundColors.secondaryDark};
`;

export const CredentialDetailsScreenButtonContentContainer = styled(SSIFlexDirectionRowViewStyled)`
  justify-content: space-evenly;
`;
