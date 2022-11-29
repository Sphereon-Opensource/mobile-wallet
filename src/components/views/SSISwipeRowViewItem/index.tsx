import React, { FC, ForwardedRef } from 'react'
import { SwipeRow } from 'react-native-swipe-list-view'

import { backgrounds } from '../../../styles/colors'
import {
  SSICredentialsOverviewScreenHiddenItemContainerStyled as HiddenItemContainer,
  SSIRippleContainerStyled as ItemContainer
} from '../../../styles/styledComponents'
import SSISwipeDeleteButton from '../../buttons/SSISwipeDeleteButton'

export interface IProps {
  viewElement: JSX.Element
  listIndex: number
  onPress: () => Promise<void>
  onDelete: () => Promise<void>
}

const SSISwipeRowViewItem: FC<IProps> = React.forwardRef((props: IProps, ref: ForwardedRef<unknown>): JSX.Element => {
  const { listIndex, viewElement, onPress, onDelete } = props

  return (
    // TODO fix style issue being an array when using styled component (rightOpenValue / stopRightSwipe)
    <SwipeRow disableRightSwipe rightOpenValue={-97} stopRightSwipe={-97}>
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
        {viewElement}
      </ItemContainer>
    </SwipeRow>
  )
})

export default SSISwipeRowViewItem
