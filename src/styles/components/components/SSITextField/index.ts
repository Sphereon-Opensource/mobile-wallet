import styled from 'styled-components/native';
import {SSIFlexDirectionRowViewStyled} from '../../containers';
import {TouchableOpacity} from 'react-native';

export const SSITextFieldContainerStyled = styled.View`
  width: 100%;
  padding: 2px 24px 4px 0;
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

export const SSITextFieldContentContainerStyled = styled(TouchableOpacity).attrs(props => ({
  disabled: props.disabled || false,
}))`
  flex-direction: row;
  padding-left: 24px;
`;
