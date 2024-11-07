import {View} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH7Styled, SSITextH7SemiBoldStyled} from '@sphereon/ui-components.ssi-react-native';

type Props = {isTrusted: boolean}; // TODO move to types later in time

export const FederationTrustViewContainerStyled = styled(View)<Props>`
  padding: 12px 16px;
  flex-direction: row;
  gap: 16px;
  background-color: ${({isTrusted}) => (isTrusted ? '#00C2491F' : '#D745001F')};
`;

export const FederationTrustViewIconContainerStyled = styled(View)`
  height: 24px;
  width: 24px;
  justify-content: center;
  align-items: center;
`;

export const FederationTrustViewContentContainerStyled = styled(View)`
  flex: 1;
  gap: 12px;
`;

export const FederationTrustViewHeaderContainerStyled = styled(View)`
  gap: 4px;
`;

export const FederationTrustViewTitleTextStyled = styled(SSITextH7SemiBoldStyled)<Props>`
  color: ${({isTrusted}) => (isTrusted ? '#B1EBC9' : '#E7C9BB')};
`;

export const FederationTrustViewDescriptionTextStyled = styled(SSITextH7Styled)<Props>`
  color: ${({isTrusted}) => (isTrusted ? '#B1EBC9' : '#E7C9BB')};
`;
