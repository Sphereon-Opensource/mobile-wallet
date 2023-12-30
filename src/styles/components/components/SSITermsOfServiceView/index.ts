import {ScrollView} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import {backgroundColors} from '@sphereon/ui-components.core';
import {SSIBasicContainerStyled} from '../../containers';
import {SSITextH5LightStyled} from '../../fonts';

export const TERMS_CONTENT_BOTTOM_MARGIN = 18;

export const SSITermsOfServiceViewContainerStyled = styled(SSIBasicContainerStyled)`
  background-color: ${backgroundColors.primaryDark};
`;

export const SSITermsOfServiceViewScrollViewStyled = styled(ScrollView)`
  margin: 16px 24px 0px 24px;
`;

export const SSITermsOfServiceViewContentTextStyled = styled(SSITextH5LightStyled)`
  margin-bottom: ${TERMS_CONTENT_BOTTOM_MARGIN}px;
`;
