import styled from 'styled-components/native';
import {ImageBackground} from 'react-native';
import AusweisLogo from '../../../../components/assets/images/AusweisLogo';
import {SSILinearGradientStyled} from '../../gradients';

export const CredentialCardPreviewViewImageBackgroundStyled = styled(ImageBackground)`
  height: 193px;
  border-radius: 16px;
  overflow: hidden;
`;

export const CredentialCardPreviewViewLogoStyled = styled(AusweisLogo)`
  margin: 12px;
`;

// TODO move color to ui-components once we start using this in the develop branch
export const CredentialCardPreviewViewInformationContainerStyled = styled.View`
  background-color: #f4f4ff;
  margin-top: auto;
`;

export const CredentialCardPreviewViewInformationBorderStyled = styled(SSILinearGradientStyled)`
  height: 2px;
`;

export const CredentialCardPreviewViewInformationContentContainerStyled = styled.View`
  padding: 12px;
  gap: 8px;
`;
