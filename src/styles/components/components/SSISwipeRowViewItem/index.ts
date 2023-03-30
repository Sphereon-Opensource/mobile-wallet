// TODO fix style issue being an array when using styled component
import {SwipeRow} from 'react-native-swipe-list-view';
import styled from 'styled-components/native';

export const SSISwipeRowViewItemContainerStyled = styled(SwipeRow).attrs({
  rightOpenValue: -97,
  stopRightSwipe: -97,
})``;

export const SSISwipeRowViewItemHiddenItemContainerStyled = styled.View`
  align-items: flex-end;
  height: 100%;
`;
