import styled from 'styled-components/native';

import {SSIBackgroundSecondaryDarkColorCss} from '../../css';
import {SSITextH5LightStyled, SSITextH7SemiBoldLightStyled} from '../../fonts';

export const SSICredentialDetailsViewContainerStyled = styled.View`
  ${SSIBackgroundSecondaryDarkColorCss};
  flex: 1;
`;

export const SSICredentialDetailsViewFooterContainerStyled = styled.View`
  width: 100%;
  margin-bottom: 8px;
  margin-top: 18px;
  padding-left: 24px;
  padding-right: 24px;
`;
export const SSICredentialDetailsViewFooterLabelCaptionStyled = styled(SSITextH5LightStyled)`
  margin-top: 2px;
  margin-left: auto;
`;

export const SSICredentialDetailsViewFooterLabelValueStyled = styled(SSITextH7SemiBoldLightStyled)`
  margin-left: auto;
`;
