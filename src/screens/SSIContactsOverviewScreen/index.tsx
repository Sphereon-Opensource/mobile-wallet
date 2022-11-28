import React, { PureComponent } from 'react'
import { ListRenderItemInfo, RefreshControl } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import { connect } from 'react-redux'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../@config/constants'
import {
  IContact,
  ScreenRoutesEnum,
  StackParamList
} from '../../@types'
import SSISwipeDeleteButton from '../../components/buttons/SSISwipeDeleteButton'
import SSIContactViewItem from '../../components/views/SSIContactViewItem'
import { RootState } from '../../store'
import { getContacts } from '../../store/actions/contact.actions'
import { backgrounds } from '../../styles/colors'
import {
  SSIBasicContainerStyled as Container,
  SSICredentialsOverviewScreenHiddenItemContainerStyled as HiddenItemContainer,
  SSIRippleContainerStyled as ItemContainer,
  SSIRippleContainerStyled
} from '../../styles/styledComponents'

interface IScreenProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACTS_OVERVIEW> {
  getContacts: () => void
  contacts: Array<IContact>
}

class SSIContactsOverviewScreen extends PureComponent<IScreenProps> {
  state = {
    refreshing: false
  }

  onRefresh = () => {
    this.props.getContacts()
    this.setState({ refreshing: false })
  }

  renderItem = (itemInfo: ListRenderItemInfo<IContact>): JSX.Element => (
      // TODO fix style issue being an array when using styled component (rightOpenValue / stopRightSwipe)
      <SwipeRow disableRightSwipe rightOpenValue={-97} stopRightSwipe={-97}>
        <HiddenItemContainer
            style={{
              backgroundColor: itemInfo.index % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark
            }}
        >
          <SSISwipeDeleteButton onPress={() => console.log('Delete contact pressed!')}/>
        </HiddenItemContainer>
        <ItemContainer
            style={{
              backgroundColor: itemInfo.index % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark
            }}
            onPress={() => console.log('Contact details pressed!')}
        >
          <SSIContactViewItem
              id={itemInfo.item.id}
              name={itemInfo.item.name}
              uri={itemInfo.item.uri}
              role={itemInfo.item.role}
          />
        </ItemContainer>
      </SwipeRow>
  )

  render() {
    return (
        <Container>
          <SwipeListView
              data={this.props.contacts}
              keyExtractor={(itemInfo: IContact) => itemInfo.id}
              renderItem={this.renderItem}
              closeOnRowOpen
              useFlatList
              initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
              removeClippedSubviews
              refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh}/>}
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
