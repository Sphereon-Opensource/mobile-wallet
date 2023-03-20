import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton'
import SSIConnectionDetailsView from '../../components/views/SSIConnectionDetailsView'
import { translate } from '../../localization/Localization'
import {
  SSIButtonBottomContainerStyled as ButtonContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIStatusBarDarkModeStyled as StatusBar
} from '../../styles/components'
import {
  MainRoutesEnum,
  ScreenRoutesEnum,
  StackParamList
} from '../../types'

const format = require('string-format')

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.IDENTITY_DETAILS>

class SSIConnectionDetailsScreen extends PureComponent<Props> { // TODO screen can be a FC
  // onConnectConfirm = async (): Promise<void> => {
  //   this.props
  //     // TODO fix non null assertion
  //     .authenticateConnectionEntity(this.props.route.params.entityId!, this.props.route.params.connection)
  //     .then(() => this.props.navigation.navigate(MainRoutesEnum.HOME, {})
  //     )
  //     .catch((error: Error) => { // TODO does this still work?
  //       // TODO refactor error type behaviour
  //       if (!/User cancelled flow/.test(error.message) && !/Pex verification manual stop/.test(error.message)) {
  //         showToast(ToastTypeEnum.TOAST_ERROR, error.message)
  //       }
  //     })
  // }

  onConnect = async (): Promise<void> => {
    const { identity } = this.props.route.params

    this.props.navigation.navigate(MainRoutesEnum.ALERT_MODAL, {
      message: format(translate('connect_provider_confirm_message'), identity.alias),
      buttons: [
        {
          caption: translate('action_confirm_label'),
          onPress: async () => console.log('todo')//this.onConnectConfirm
        }
      ]
    })
  }

  render() {
    const { identity } = this.props.route.params

    return (
      <Container>
        <StatusBar/>
        <SSIConnectionDetailsView
          identity={identity}
        />
        <ButtonContainer>
          <SSIPrimaryButton
            title={translate('connection_details_action_connect')}
            onPress={this.onConnect}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{ height: 42, width: 300 }}
          />
        </ButtonContainer>
      </Container>
    )
  }
}

export default connect(null, null)(SSIConnectionDetailsScreen)
