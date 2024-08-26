import styled from 'styled-components/native';
import {borderColors, fontColors} from '@sphereon/ui-components.core';
import MagnifyingGlassIcon from '../../../../components/assets/icons/MagnifyingGlassIcon';

export const SearchFieldContainerStyled = styled.View`
  flex-direction: row;
  gap: 12px;
  border-color: ${borderColors.dark};
  border-width: 1px;
  border-radius: 4px;
  align-items: center;
  padding: 12px 16px 12px 20px;
`;

export const SearchFieldMagnifyingGlassIconStyled = styled(MagnifyingGlassIcon).attrs({
  color: fontColors.light,
})``;
