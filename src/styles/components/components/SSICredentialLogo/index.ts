import {ImageBackground} from 'react-native';
import styled from 'styled-components/native';

import SSIPlaceholderLogo from '../../../../components/assets/logos/SSIPlaceholderLogo';

export const SSICredentialLogoContainerStyled = styled.View`
  width: 75px;
  height: 50px;
  border-radius: 4.6px;
  overflow: hidden;
`;

export const SSICredentialLogoImageStyled = styled(ImageBackground).attrs({
  resizeMode: 'cover',
})`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const SSICredentialLogoPlaceholderImageStyled = styled(SSIPlaceholderLogo).attrs({
  size: 26,
})``;
