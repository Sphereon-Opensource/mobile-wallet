import React, {PureComponent} from 'react';
import {ColorValue, EmitterSubscription, Keyboard} from 'react-native';
import {SSIButtonBottomContainerStyled as ButtonContainer, SSIButtonsContainerSpacerStyled as Spacer} from '../../../styles/components';
import {IButton} from '../../../types';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';

export interface Props {
  primaryButton?: IButton;
  secondaryButton?: IButton;
  backgroundColor?: ColorValue;
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
    const {backgroundColor, primaryButton, secondaryButton} = this.props;
    const {keyboardVisible} = this.state;

    return (
      <ButtonContainer style={{paddingBottom: keyboardVisible ? 18 : 36, ...(backgroundColor && {backgroundColor})}}>
        {secondaryButton && (
          <SecondaryButton
            caption={secondaryButton.caption}
            onPress={secondaryButton.onPress}
            disabled={secondaryButton.disabled}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{
              height: 42,
              minWidth: 145,
              ...(!primaryButton && {width: 300}),
            }}
          />
        )}
        <Spacer />
        {primaryButton && (
          <PrimaryButton
            caption={primaryButton.caption}
            onPress={primaryButton.onPress}
            disabled={primaryButton.disabled}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{height: 42, minWidth: 145, ...(!secondaryButton && {width: 300})}}
          />
        )}
      </ButtonContainer>
    );
  }
}

export default SSIButtonsContainer;
