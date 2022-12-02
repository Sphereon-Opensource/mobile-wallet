import React, { FC } from 'react'
import { ListRenderItemInfo, RefreshControl } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../../@config/constants'
import { IConnectionViewItem } from '../../../@types'
import { SSIConnectionsViewContainerStyled } from '../../../styles/components'
import SSIConnectionViewItem from '../SSIConnectionViewItem'
import SSISwipeRowViewItem from '../SSISwipeRowViewItem'

export interface IProps {
  connections: Array<IConnectionViewItem>
}

const SSIConnectionsView: FC<IProps> = (props: IProps): JSX.Element => {
  const { connections } = props
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = () => {
    setRefreshing(false)
  }

  const renderItem = (itemInfo: ListRenderItemInfo<IConnectionViewItem>): JSX.Element => (
      <SSISwipeRowViewItem
          listIndex={itemInfo.index}
          viewItem={
            <SSIConnectionViewItem
                name={itemInfo.item.entityName}
                // TODO we need a connection uri which currently is not available
                uri={itemInfo.item.connection.config.redirectUrl}
            />
          }
          onPress={async () => console.log('Connection pressed!')}
          onDelete={async () => console.log('Delete connection pressed!')}
      />
  )

  return (
      <SSIConnectionsViewContainerStyled>
        <SwipeListView
            data={connections}
            keyExtractor={(itemInfo: IConnectionViewItem) => itemInfo.connection.id}
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
