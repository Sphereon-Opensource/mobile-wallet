import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, { PureComponent } from 'react'
import {View} from 'react-native';
import { connect } from 'react-redux'

import {PIN_CODE_LENGTH} from '../../@config/constants';
import SSIPinCode from '../../components/pinCodes/SSIPinCode';
import {translate} from '../../localization/Localization';
import {getPin} from '../../services/storageService';
import {setActiveUser} from '../../store/actions/user.actions';
import {SSIBasicHorizontalCenterContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../styles/components';
import {IUser, RootState, ScreenRoutesEnum, StackParamList} from '../../types';

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOCK> {
  users: Map<string, IUser>
  setActiveUser: (userId: string) => void
}

// This screen should be extended to do pin code or biometrics authentication

class SSILockScreen extends PureComponent<IProps> {
  onLogin = async (): Promise<void> => {
    const user: IUser = this.props.users.values().next().value;
    await this.props.setActiveUser(user.id)
  }

  onVerification = async (value: string): Promise<void> => {
    // We are currently only supporting a single user right now
    if (value !== await getPin()) {
      return Promise.reject('Invalid pin code');
    }

    await this.onLogin()
  };

  render() {
    return (
      <Container>
        <StatusBar />
        <View style={{marginTop: 130}}>
          <SSIPinCode
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

const mapStateToProps = (state: RootState) => {
  return {
    users: state.user.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setActiveUser: (userId: string) => dispatch(setActiveUser(userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SSILockScreen);
