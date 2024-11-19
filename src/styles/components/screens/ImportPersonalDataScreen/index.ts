import {styled} from 'styled-components/native';
import {SSITextH5LightStyled} from '../../fonts';
import {fontColors} from '@sphereon/ui-components.core';
import {fontSize} from 'src/styles/typography';

export const ImportPersonalDataContainer = styled.View`
  position: relative;
  flex: 1;
  display: flex;
  background-color: #202537;
  align-items: stretch;
  justify-content: center;
  padding-bottom: 20px;
`;

export const ImportPersonalDataContentContainer = styled.Pressable`
  margin-top: 20px;
  flex: 1;
  align-items: center;
  background-color: transparent;
  padding: 0 20px 0 20px;
`;

export const ImportPersonalDataNFCCaptionText = styled(SSITextH5LightStyled)`
  color: ${fontColors.light};
  font-size: ${fontSize[200]}px;
  margin-bottom: 10px;
`;

export const ImportPersonalDataFooter = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
`;
