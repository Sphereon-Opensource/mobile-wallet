import styled from 'styled-components/native';

import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSITextH7SemiBoldLightStyled} from '../../fonts';

export const SSITextFieldContainerStyled = styled.View`
  width: 100%;
  padding: 2px 24px 4px 0px;
`;

export const SSITextFieldHeaderContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  padding-left: 24px;
`;

export const SSITextFieldStatusLabelContainerStyled = styled.View`
  width: 24px;
`;

export const SSITextFieldEditBadgeContainerStyled = styled.View`
  margin: 3px auto auto auto;
`;

export const SSITextFieldContentBadgeContainerStyled = styled.View`
  width: 24px;
`;

export const SSITextFieldContentTextStyled = styled(SSITextH7SemiBoldLightStyled)`
  margin-right: 24px;
`;
