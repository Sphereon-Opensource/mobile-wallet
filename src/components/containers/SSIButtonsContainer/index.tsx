import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {PureComponent} from 'react';
import {ColorValue, EmitterSubscription, Keyboard, View, ViewStyle} from 'react-native';
import {SSIButtonBottomContainerStyled as ButtonContainer} from '../../../styles/components';
import {IButton} from '../../../types';

export interface Props {
  primaryButton?: IButton;
  secondaryButton?: IButton;
  backgroundColor?: ColorValue;
  style?: ViewStyle;
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
          paddingVertical: keyboardVisible ? 16 : 32,
          gap: 16,
          ...(backgroundColor && {backgroundColor}),
          ...style,
        }}>
        {secondaryButton && (
          <View style={{flex: 1}}>
            <SecondaryButton
              caption={secondaryButton.caption}
              onPress={secondaryButton.onPress}
              disabled={secondaryButton.disabled}
              accessibilityRole="button"
              accessibilityLabel={secondaryButton.accessibilityLabel}
            />
          </View>
        )}
        {primaryButton && (
          <View style={{flex: 1}}>
            <PrimaryButton
              accessibilityRole="button"
              caption={primaryButton.caption}
              onPress={primaryButton.onPress}
              accessibilityLabel={primaryButton.accessibilityLabel}
              disabled={typeof primaryButton.disabled === 'function' ? primaryButton.disabled() : primaryButton.disabled}
            />
          </View>
        )}
      </ButtonContainer>
    );
  }
}

export default SSIButtonsContainer;
