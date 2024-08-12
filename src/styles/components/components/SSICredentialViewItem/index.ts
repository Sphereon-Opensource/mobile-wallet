import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSITextH3LightStyled, SSITextH5LightStyled} from '../../fonts';

export const SSICredentialViewItemContainerStyled = styled.View`
  padding: 16px 21px 18px 24px;
`;

export const SSICredentialViewItemContentTopContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 2px;
`;

export const SSICredentialViewItemExpirationDateCaptionStyled = styled(SSITextH5LightStyled)`
  margin-left: auto;
`;

export const SSICredentialViewItemContentMiddleContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 13px;
`;

export const SSICredentialViewItemStatusContainerStyled = styled.View`
  margin-top: 3px;
  margin-left: auto;
  padding-left: 9px;
`;

export const SSICredentialViewItemTitleCaptionStyled = styled(SSITextH3LightStyled)`
  flex: 1;
`;
