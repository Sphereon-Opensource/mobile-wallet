import React, {CSSProperties, PureComponent} from 'react';
import {ColorValue, EmitterSubscription, Keyboard, View} from 'react-native';
import {SSIButtonBottomContainerStyled as ButtonContainer} from '../../../styles/components';
import {IButton} from '../../../types';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';

export interface Props {
  primaryButton?: IButton;
  secondaryButton?: IButton;
  backgroundColor?: ColorValue;
  style?: CSSProperties;
}

interface IState {
  keyboardVisible: boolean;
}

class SSIButtonsContainer extends PureComponent<Props, IState> {
  keyboardDidShowListener: EmitterSubscription;
  keyboardDidHideListener: EmitterSubscription;
  state: IState = {
    keyboardVisible: false,
  };

  componentDidMount = () => {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  };

  componentWillUnmount = () => {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  };

  _keyboardDidShow = () => {
    this.setState({keyboardVisible: true});
  };

  _keyboardDidHide = () => {
    this.setState({keyboardVisible: false});
  };

  render() {
    const {backgroundColor, primaryButton, secondaryButton, style} = this.props;
    const {keyboardVisible} = this.state;

    return (
      <ButtonContainer
        style={{
          paddingBottom: keyboardVisible ? 18 : 36,
          ...(backgroundColor && {backgroundColor}),
          ...style,
        }}>
        {secondaryButton && (
          <View style={{flex: 1, flexDirection: 'column'}}>
            <SecondaryButton caption={secondaryButton.caption} onPress={secondaryButton.onPress} disabled={secondaryButton.disabled} />
          </View>
        )}
        {primaryButton && (
          <View style={{flex: 1, flexDirection: 'column'}}>
            <PrimaryButton caption={primaryButton.caption} onPress={primaryButton.onPress} disabled={primaryButton.disabled} />
          </View>
        )}
      </ButtonContainer>
    );
  }
}

export default SSIButtonsContainer;
