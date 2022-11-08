import { IConnection, IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'
import React, { PureComponent } from 'react'
import { ListRenderItemInfo, RefreshControl } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import { connect } from 'react-redux'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../@config/constants'
import {
  ConnectionRoutesEnum,
  ConnectionStatusEnum,
  HomeRoutesEnum,
  IConnectionViewItem,
  StackParamList
} from '../../@types'
import SSISwipeDeleteButton from '../../components/buttons/SSISwipeDeleteButton'
import SSIConnectionsViewItem from '../../components/views/SSIConnectionsViewItem'
import { RootState } from '../../store'
import { dispatchConnectionParties } from '../../store/actions/connection.actions'
import { IAuthenticatedEntity } from '../../store/types/authenticate.types'
import { backgrounds } from '../../styles/colors'
import {
  SSIBasicContainerStyled as Container,
  SSICredentialsViewItemContentContainerStyled as ContentContainer,
  SSICredentialsOverviewScreenHiddenItemContainerStyled as HiddenItemContainer,
  SSICredentialsViewItemContainerStyled as ItemContainer
} from '../../styles/styledComponents'

interface IScreenProps extends NativeStackScreenProps<StackParamList, ConnectionRoutesEnum.CONNECTIONS_OVERVIEW> {
  dispatchConnectionParties: () => void
  connectionParties: Array<IConnectionParty>
  authenticationEntities: Array<IAuthenticatedEntity>
}

export class SSIConnectionsOverviewScreen extends PureComponent<IScreenProps> {
  state = {
    refreshing: false
  }

  onRefresh = () => {
    this.props.dispatchConnectionParties()
    this.setState({ refreshing: false })
  }

  renderItem = (itemInfo: ListRenderItemInfo<IConnectionViewItem>): JSX.Element => (
    // TODO fix style issue being an array when using styled component (rightOpenValue / stopRightSwipe)
    <SwipeRow disableRightSwipe rightOpenValue={-97} stopRightSwipe={-97}>
      <HiddenItemContainer
        style={{
          backgroundColor: itemInfo.index % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark
        }}
      >
        <SSISwipeDeleteButton onPress={() => console.log('Delete connection pressed!')} />
      </HiddenItemContainer>
      <ItemContainer
        style={{
          backgroundColor: itemInfo.index % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark
        }}
      >
        <ContentContainer
          onPress={() => this.props.navigation.navigate(ConnectionRoutesEnum.CONNECTION_DETAILS, itemInfo.item)}
        >
          <SSIConnectionsViewItem
            entityId={itemInfo.item.entityId}
            entityName={itemInfo.item.entityName}
            connection={itemInfo.item.connection}
            connectionStatus={itemInfo.item.connectionStatus}
          />
        </ContentContainer>
      </ItemContainer>
    </SwipeRow>
  )

  render() {
    const connections = this.props.connectionParties
      .map((connectionParty: IConnectionParty) => {
        return connectionParty.connections.map((connection: IConnection) => {
          return {
            entityId: connectionParty.id,
            entityName: connectionParty.name,
            connection,
            connectionStatus: this.props.authenticationEntities.find(
              (entity: IAuthenticatedEntity) => entity.entityId === connectionParty.id
            )
              ? ConnectionStatusEnum.CONNECTED
              : ConnectionStatusEnum.DISCONNECTED
          }
        })
      })
      .flat()

    return (
      <Container>
        <SwipeListView
          data={connections}
          keyExtractor={(itemInfo: IConnectionViewItem) => itemInfo.connection.id}
          renderItem={this.renderItem}
          closeOnRowOpen
          useFlatList
          initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
        />
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatchConnectionParties: () => dispatch(dispatchConnectionParties())
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    connectionParties: state.connection.parties,
    authenticationEntities: state.authentication.entities
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SSIConnectionsOverviewScreen)
