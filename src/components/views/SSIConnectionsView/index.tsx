import { IConnection } from '@sphereon/ssi-sdk-data-store-common'
import React, { FC } from 'react'
import { ListRenderItemInfo, RefreshControl } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../../@config/constants'
import { SSIConnectionsViewContainerStyled } from '../../../styles/components'
import SSIConnectionViewItem from '../SSIConnectionViewItem'
import SSISwipeRowViewItem from '../SSISwipeRowViewItem'

export interface IProps {
  connections: Array<IConnection>
}

const SSIConnectionsView: FC<IProps> = (props: IProps): JSX.Element => {
  const { connections } = props
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = async (): Promise<void> => {
    setRefreshing(false)
  }

  const onDelete = async (): Promise<void> => {
    console.log('Delete connection pressed!')
  }

  const onItemPress = async (yaconnection: IConnection): Promise<void> => {
    console.log('Connection pressed!')
  }

  const renderItem = (itemInfo: ListRenderItemInfo<IConnection>): JSX.Element => (
    <SSISwipeRowViewItem
      listIndex={itemInfo.index}
      viewItem={
        <SSIConnectionViewItem
          // TODO we need a connection name
          name={itemInfo.item.id}
          // TODO we need a connection uri which currently is not available
          uri={itemInfo.item.type}
        />
      }
      onPress={() => onItemPress(itemInfo.item)}
      onDelete={onDelete}
    />
  )

  return (
    <SSIConnectionsViewContainerStyled>
      <SwipeListView
        data={connections}
        keyExtractor={(itemInfo: IConnection) => itemInfo.id}
        renderItem={renderItem}
        closeOnRowOpen
        closeOnRowBeginSwipe
        useFlatList
        initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SSIConnectionsViewContainerStyled>
  )
}

export default SSIConnectionsView
