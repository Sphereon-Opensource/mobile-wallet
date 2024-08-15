import styled from 'styled-components/native';
import {moderateScale} from 'react-native-size-matters';
import {borderColors, fontColors} from '@sphereon/ui-components.core';
import {SSITextFieldLinearTextGradientStyled} from '../../gradients';

export const CredentialCatalogScreenPreviewCredentialContainerStyled = styled.View`
  margin: 0 24px;
  padding: 8px 0 28px;
`;

export const CredentialCatalogScreenPreviewCredentialContentContainerStyled = styled.View`
  gap: 16px;
`;

export const CredentialCatalogScreenRelevantCredentialContainerStyled = styled.View`
  gap: 12px;
`;

export const CredentialCatalogScreenRelevantCredentialHeaderContainerStyled = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const CredentialCatalogViewAllContainerStyled = styled.View`
  margin-left: auto;
`;

// TODO we need to separate the css from the text so we can use it in places like this, same like we do in the react ui-components package
export const CredentialCatalogViewAllTextStyled = styled(SSITextFieldLinearTextGradientStyled).attrs({
  textStyle: {fontWeight: '400', fontSize: moderateScale(12), lineHeight: 18, fontFamily: 'Poppins-Regular', color: fontColors.light},
})``;

export const CredentialCatalogDiscoverCredentialsContainerStyled = styled.View`
  flex: 1;
  gap: 8px;
`;

export const CredentialCatalogScreenDiscoverCredentialsHeaderContainerStyled = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0 24px;
`;

export const CredentialCatalogCredentialListContainerStyled = styled.View`
  border-top-color: ${borderColors.dark};
  border-top-width: 1px;
  flex: 1;
`;
