import styled from 'styled-components/native';

import {backgrounds} from '../../../colors';
import {SSIFlexDirectionRowViewStyled} from '../../containers';

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
  backgroundcolor: ${backgrounds.secondaryDark};
`;

export const SSICredentialDetailsScreenButtonContentContainer = styled(SSIFlexDirectionRowViewStyled)`
  margin-top: auto;
  margin-bottom: auto;
  justify-content: space-between;
  padding-left: 24px;
  padding-right: 24px;
`;
