import {styled} from 'styled-components/native';
import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {SSITextH3LightStyled, SSITextH4LightStyled} from '../../../../styles/components';

export const NewContactViewItemContainer = styled(SSIFlexDirectionRowViewStyled)`
  align-items: stretch;
`;

export const NewContactViewItemLogoContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const NewContactViewItemNameCaption = styled(SSITextH3LightStyled)`
  line-height: 20px;
`;

export const NewContactViewItemRolesCaption = styled(SSITextH4LightStyled)`
  line-height: 16px;
`;
