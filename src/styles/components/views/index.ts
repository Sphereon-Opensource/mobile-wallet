import {FlatList} from 'react-native';
import styled from 'styled-components/native';

// added a typing workaround as styled.FlatList does not support typing definition of styled-components
export const SSIDetailsViewDetailsListStyled = styled.FlatList`
  margin-bottom: 12px;
` as unknown as typeof FlatList;
