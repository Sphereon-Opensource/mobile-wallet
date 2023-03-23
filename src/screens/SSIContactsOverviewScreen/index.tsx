import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { IContact } from '@sphereon/ssi-sdk-data-store'
import React, { PureComponent } from 'react'
import { ListRenderItemInfo, RefreshControl } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { connect } from 'react-redux'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../@config/constants'
import SSIContactViewItem from '../../components/views/SSIContactViewItem'
import SSISwipeRowViewItem from '../../components/views/SSISwipeRowViewItem'
import { getContacts } from '../../store/actions/contact.actions'
import { SSIBasicContainerStyled as Container } from '../../styles/components'
import { RootState, ScreenRoutesEnum, StackParamList } from '../../types'

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACTS_OVERVIEW> {
  getContacts: () => void
  contacts: Array<IContact>
}

interface IState {
  refreshing: boolean
}

class SSIContactsOverviewScreen extends PureComponent<IProps, IState> {
  state: IState = {
    refreshing: false
  }

  onRefresh = async (): Promise<void> => {
    this.props.getContacts()
    this.setState({ refreshing: false })
  }

  /**
   * TODO for WAL-410 this line has to be uncommented.
   * onDelete = async (): Promise<void> => {
   *  console.log('Delete contact pressed!')
   * }
   */

  onItemPress = async (contact: IContact): Promise<void> => {
    this.props.navigation.navigate(ScreenRoutesEnum.CONTACT_DETAILS, { contact })
  }

  renderItem = (itemInfo: ListRenderItemInfo<IContact>): JSX.Element => (
    <SSISwipeRowViewItem
      listIndex={itemInfo.index}
      viewItem={
        <SSIContactViewItem
          name={itemInfo.item.alias}
          uri={itemInfo.item.uri}
          roles={itemInfo.item.roles}
        />
      }
      onPress={() => this.onItemPress(itemInfo.item)}
      /*onDelete={this.onDelete}*/ // TODO for WAL-410 this line has to be uncommented.
    />
  )

  render() {
    return (
      <Container>
        <SwipeListView
          data={this.props.contacts}
          keyExtractor={(itemInfo: IContact) => itemInfo.id}
          renderItem={this.renderItem}
          closeOnRowOpen
          closeOnRowBeginSwipe
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
    getContacts: () => dispatch(getContacts())
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    contacts: state.contact.contacts
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SSIContactsOverviewScreen)
