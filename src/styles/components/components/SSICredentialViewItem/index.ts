import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSITextH3LightStyled, SSITextH5LightStyled} from '../../fonts';

export const SSICredentialViewItemContainerStyled = styled.View`
  padding: 16px 21px 18px 24px;
`;

export const SSICredentialViewItemRowStyled = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const SSICredentialViewItemImageContainerStyled = styled.View`
  justify-content: center;
  margin-right: 7px;
`;

export const SSICredentialViewItemCardStyled = styled.View`
  border-radius: 4.606px;
  overflow: hidden;
  width: 75px;
  position: relative;
`;

export const SSICredentialViewItemBackgroundImageStyled = styled.Image`
  width: 100%;
  height: 100%;
`;

export const SSICredentialViewItemLogoContainerStyled = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  justify-content: center;
  align-items: center;
`;

export const SSICredentialViewItemLogoImageStyled = styled.Image`
  width: 32px;
`;

export const SSICredentialViewItemDataContainerStyled = styled.View`
  flex: 1;
`;

export const SSICredentialViewItemContentTopContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 0px;
`;

export const SSICredentialViewItemExpirationDateCaptionStyled = styled(SSITextH5LightStyled)`
  margin-left: auto;
`;

export const SSICredentialViewItemContentMiddleContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 6px;
`;

export const SSICredentialViewItemStatusContainerStyled = styled.View`
  margin-top: 3px;
  margin-left: auto;
  padding-left: 9px;
`;

export const SSICredentialViewItemTitleCaptionStyled = styled(SSITextH3LightStyled)`
  flex: 1;
`;
