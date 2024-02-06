import styled from 'styled-components/native';

import {SSIRippleContainerStyled} from '../../containers';
import {SSITextH3LightStyled, SSITextH4LightStyled, SSITextH5LightStyled} from '../../fonts';
import {fontColors, statusColors} from '@sphereon/ui-components.core';

export const SSICredentialRequiredViewItemContainerStyled = styled(SSIRippleContainerStyled)`
  padding: 16px 22px 18px 24px;
`;

export const SSICredentialRequiredViewItemIconContainerStyled = styled.View`
  justify-content: center;
  margin-right: 12px;
`;

export const SSICredentialRequiredViewItemCredentialTitleCaptionStyled = styled(SSITextH3LightStyled)`
  margin-bottom: 2px;
`;

export const SSICredentialRequiredViewItemCredentialPurposeCaptionStyled = styled(SSITextH4LightStyled)`
  margin-bottom: 2px;
  color: ${fontColors.greyedOut};
`;

export const SSICredentialRequiredViewItemMatchInfoContainerStyled = styled.View`
  width: 100px;
  margin-left: auto;
`;

export const SSICredentialRequiredViewItemMatchInfoCaptionStyled = styled(SSITextH5LightStyled)`
  margin: 2px 0 0 auto;
`;

export const SSICredentialRequiredViewItemSelectedCredentialsCaptionStyled = styled(SSITextH4LightStyled)`
  opacity: 0.8;
`;

export const SSICredentialRequiredViewItemNoneAvailableCaptionStyled = styled(SSITextH4LightStyled)`
  color: ${statusColors.error};
`;

export const SSICredentialRequiredViewNoneAvailableContainerStyled = styled.View`
  margin-left: 28px;
  margin-top: 6px;
`;
