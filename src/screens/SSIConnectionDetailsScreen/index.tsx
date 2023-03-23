import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';

import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton';
import SSIConnectionDetailsView from '../../components/views/SSIConnectionDetailsView';
import {translate} from '../../localization/Localization';
import {
  SSIButtonBottomContainerStyled as ButtonContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {MainRoutesEnum, ScreenRoutesEnum, StackParamList, ToastTypeEnum} from '../../types';
import {showToast} from '../../utils/ToastUtils';
import {authenticate} from '../../services/authenticationService';

const format = require('string-format');

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.IDENTITY_DETAILS>;

class SSIConnectionDetailsScreen extends PureComponent<Props> {
  // TODO screen can be a FC
  onConnectConfirm = async (): Promise<void> => {
    const {identity} = this.props.route.params;

    if (!identity.connection) {
      showToast(ToastTypeEnum.TOAST_ERROR, 'identity must contain a connection'); // TODO
      return;
    }

    authenticate(identity.connection).catch((error: Error) => {
      showToast(ToastTypeEnum.TOAST_ERROR, error.message);
    });
  };

  onConnect = async (): Promise<void> => {
    const {identity} = this.props.route.params;
    const {navigation} = this.props;

    navigation.navigate(MainRoutesEnum.ALERT_MODAL, {
      message: format(translate('connect_provider_confirm_message'), identity.alias),
      buttons: [
        {
          caption: translate('action_confirm_label'),
          onPress: this.onConnectConfirm,
        },
      ],
    });
  };

  render() {
    const {identity} = this.props.route.params;

    return (
      <Container>
        <StatusBar />
        <SSIConnectionDetailsView identity={identity} />
        <ButtonContainer>
          <SSIPrimaryButton
            title={translate('connection_details_action_connect')}
            onPress={this.onConnect}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{height: 42, width: 300}}
          />
        </ButtonContainer>
      </Container>
    );
  }
}

export default connect(null, null)(SSIConnectionDetailsScreen);
