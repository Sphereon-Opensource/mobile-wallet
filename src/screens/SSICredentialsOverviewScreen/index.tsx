import { VerifiableCredential } from '@veramo/core'
import React, { PureComponent } from 'react'
import { ListRenderItemInfo, RefreshControl } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack'
import { SwipeListView } from 'react-native-swipe-list-view'
import { connect } from 'react-redux'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../@config/constants'
import { ICredentialSummary, ScreenRoutesEnum, StackParamList } from '../../@types'
import { dataStoreGetVerifiableCredential } from '../../agent'
import SSICredentialViewItem from '../../components/views/SSICredentialViewItem'
import SSISwipeRowViewItem from '../../components/views/SSISwipeRowViewItem'
import { RootState } from '../../store'
import { getVerifiableCredentials } from '../../store/actions/credential.actions'
import { SSIBasicContainerStyled as Container } from '../../styles/styledComponents'

interface IScreenProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_OVERVIEW> {
  getVerifiableCredentials: () => void
  verifiableCredentials: Array<ICredentialSummary>
}

class SSICredentialsOverviewScreen extends PureComponent<IScreenProps> {
  state = {
    refreshing: false
  }

  onRefresh = () => {
    this.props.getVerifiableCredentials()
    this.setState({ refreshing: false })
  }

  renderItem = (itemInfo: ListRenderItemInfo<ICredentialSummary>): JSX.Element => (
    <SSISwipeRowViewItem
      listIndex={itemInfo.index}
      viewItem={
        <SSICredentialViewItem
          id={itemInfo.item.id}
          title={itemInfo.item.title}
          issuer={itemInfo.item.issuer}
          issueDate={itemInfo.item.issueDate}
          expirationDate={itemInfo.item.expirationDate}
          credentialStatus={itemInfo.item.credentialStatus}
          properties={[]}
          signedBy={itemInfo.item.signedBy}
        />
      }
      onPress={async () =>
        dataStoreGetVerifiableCredential({ hash: itemInfo.item.id }).then((vc: VerifiableCredential) =>
          this.props.navigation.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
            rawCredential: vc as VerifiableCredential,
            credential: itemInfo.item,
            showActivity: true
          })
        )
      }
      onDelete={async () => console.log('Delete contact pressed!')}
    />
  )

  render() {
    return (
      <Container>
        <SwipeListView
          data={this.props.verifiableCredentials}
          keyExtractor={(itemInfo: ICredentialSummary) => itemInfo.id}
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
    getVerifiableCredentials: () => dispatch(getVerifiableCredentials())
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    verifiableCredentials: state.credential.verifiableCredentials
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SSICredentialsOverviewScreen)
