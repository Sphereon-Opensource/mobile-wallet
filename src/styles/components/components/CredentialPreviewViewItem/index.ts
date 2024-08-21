import styled from 'styled-components/native';
import {SSICredentialMiniCardView} from '@sphereon/ui-components.ssi-react-native';
import {SSIFlexDirectionRowViewStyled} from '../../containers';

export const CredentialPreviewViewItemContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  padding: 16px 21px 18px 24px;
  gap: 15px;
`;

export const CredentialPreviewCredentialContentContainerStyled = styled.View`
  flex: 1;
  justify-content: center;
`;

export const CredentialPreviewCredentialCardStyled = styled(SSICredentialMiniCardView).attrs({
  style: {justifyContent: 'center'},
})``;
