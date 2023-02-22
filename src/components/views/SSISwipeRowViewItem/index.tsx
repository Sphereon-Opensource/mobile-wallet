import React, { FC, ForwardedRef } from 'react'
import { SwipeRow } from 'react-native-swipe-list-view'

import { backgrounds } from '../../../styles/colors'
import {
  SSISwipeRowViewItemHiddenItemContainerStyled as HiddenItemContainer,
  SSIRippleContainerStyled as ItemContainer
} from '../../../styles/components'
import SSISwipeDeleteButton from '../../buttons/SSISwipeDeleteButton'

export interface IProps {
  viewItem: JSX.Element
  listIndex: number
  onPress: () => Promise<void>
  onDelete?: () => Promise<void>
}

const SSISwipeRowViewItem: FC<IProps> = React.forwardRef((props: IProps, ref: ForwardedRef<unknown>): JSX.Element => {
  const { listIndex, viewItem, onPress, onDelete } = props

  return (
    // TODO fix style issue being an array when using styled component (rightOpenValue / stopRightSwipe)
    // In WAL-410 remove disableLeftSwipe attribute from the following line.
    <SwipeRow disableRightSwipe disableLeftSwipe={!props.onDelete} rightOpenValue={-97} stopRightSwipe={-97}>
      <HiddenItemContainer
        style={{
          backgroundColor: listIndex % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark
        }}
      >
        <SSISwipeDeleteButton onPress={onDelete} />
      </HiddenItemContainer>
      <ItemContainer
        style={{
          backgroundColor: listIndex % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark
        }}
        onPress={onPress}
      >
        {viewItem}
      </ItemContainer>
    </SwipeRow>
  )
})

export default SSISwipeRowViewItem
