import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {PureComponent} from 'react';
import {BackHandler, NativeEventSubscription, View} from 'react-native';

import {PIN_CODE_LENGTH} from '../../../@config/constants';
import SSIPinCode from '../../../components/pinCodes/SSIPinCode';
import {translate} from '../../../localization/Localization';
import {SSIBasicHorizontalCenterContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../../types';

type PincodeSetProps = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PIN_CODE_SET>;

enum StateKeyEnum {
  CHOOSE_PIN = 'choose_pin',
  CONFIRM_PIN = 'confirm_pin',
}

interface IState {
  pin: string;
  isConfirmPin: boolean;
}

class SSIPinCodeSetScreen extends PureComponent<PincodeSetProps, IState> {
  hardwareBackPressListener: NativeEventSubscription;
  state: IState = {
    pin: '',
    isConfirmPin: false,
  };

  _onBack = (): boolean => {
    const {navigation} = this.props;
    const {isConfirmPin} = this.state;

    if (isConfirmPin) {
      /**
       * When true is returned the event will not be bubbled up
       * & no other back action will execute
       */
      // TODO fix type issue
      navigation.setOptions({headerTitle: translate('pin_code_choose_pin_code_title')});
      navigation.setParams({headerSubTitle: translate('pin_code_choose_pin_code_subtitle')});
      this.setState({pin: '', isConfirmPin: false});
    }
    void this.props.route.params.onBack();
    return true;
    // /**
    //  * Returning false will let the event bubble up & let other event listeners
    //  * or the system's default back action to be executed.
    //  */
    // return false;
  };

  componentDidMount = (): void => {
    this.hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', this._onBack);
  };

  componentWillUnmount = (): void => {
    this.hardwareBackPressListener.remove();
  };

  onVerification = async (value: string): Promise<void> => {
    const {navigation} = this.props;
    const {isConfirmPin, pin} = this.state;

    if (isConfirmPin) {
      if (value !== pin) {
        return Promise.reject(Error('Invalid code'));
      }
      await this.props.route.params.onNext();
    } else {
      // TODO fix type issue
      navigation.setOptions({headerTitle: translate('pin_code_confirm_pin_code_title')});
      navigation.setParams({headerSubTitle: translate('pin_code_confirm_pin_code_subtitle')});
      this.setState({pin: value, isConfirmPin: true});
      // void this.props.route.params.onNext();
    }
  };

  render() {
    const {isConfirmPin} = this.state;

    return (
      <Container>
        <StatusBar />
        <View style={{marginTop: isConfirmPin ? 127 : 110}}>
          <SSIPinCode
            // TODO fix this borderline hacking solution for resetting a components state
            // Setting a new key will force the component to mount a new one, resetting the state of the component
            key={isConfirmPin ? StateKeyEnum.CHOOSE_PIN : StateKeyEnum.CONFIRM_PIN}
            length={PIN_CODE_LENGTH}
            accessibilityLabel={translate('pin_code_accessibility_label')}
            accessibilityHint={translate('pin_code_accessibility_hint')}
            errorMessage={translate('pin_code_invalid_code_message')}
            onVerification={this.onVerification}
          />
        </View>
      </Container>
    );
  }
}

export default SSIPinCodeSetScreen;
