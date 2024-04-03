import React, {FC, ForwardedRef} from 'react';
import {View, ViewStyle} from 'react-native';
import {SwipeRow} from 'react-native-swipe-list-view';

import {
  SSISwipeRowViewItemHiddenItemContainerStyled as HiddenItemContainer,
  SSIRippleContainerStyled as ItemContainer,
} from '../../../styles/components';
import SSISwipeDeleteButton from '../../buttons/SSISwipeDeleteButton';

export interface IProps {
  viewItem: JSX.Element;
  onPress: () => Promise<void>;
  onDelete: () => Promise<void>;
  style?: ViewStyle;
  hiddenStyle?: ViewStyle;
}

const SSISwipeRowViewItem: FC<IProps> = React.forwardRef((props: IProps, ref: ForwardedRef<unknown>): JSX.Element => {
  const {viewItem, onPress, onDelete, style, hiddenStyle} = props;

  return (
    // TODO fix style issue being an array when using styled component (rightOpenValue / stopRightSwipe)
    // https://github.com/jemise111/react-native-swipe-list-view/issues/614
    <SwipeRow disableRightSwipe rightOpenValue={-97} stopRightSwipe={-97}>
      <HiddenItemContainer style={hiddenStyle}>
        <SSISwipeDeleteButton onPress={onDelete} />
      </HiddenItemContainer>
      <ItemContainer style={style} onPress={onPress}>
        <View>{viewItem}</View>
      </ItemContainer>
    </SwipeRow>
  );
});

export default SSISwipeRowViewItem;
