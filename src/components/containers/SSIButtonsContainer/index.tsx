import React, { PureComponent } from 'react'
import { EmitterSubscription, Keyboard } from 'react-native'

import { IButton } from '../../../@types'
import {
  SSIButtonBottomContainerStyled as ButtonContainer,
  SSIButtonsContainerSpacerStyled as Spacer
} from '../../../styles/components'
import SSIPrimaryButton from '../../buttons/SSIPrimaryButton'
import SSISecondaryButton from '../../buttons/SSISecondaryButton'

export interface Props {
  primaryButton?: IButton
  secondaryButton?: IButton
}

interface IState {
  keyboardVisible: boolean
}

class SSIButtonsContainer extends PureComponent<Props, IState> {
  keyboardDidShowListener: EmitterSubscription
  keyboardDidHideListener: EmitterSubscription
  state = {
    keyboardVisible: false
  }

  componentDidMount = () => {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
  }

  componentWillUnmount = () => {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  _keyboardDidShow = () => {
    this.setState({ keyboardVisible: true })
  }

  _keyboardDidHide = () => {
    this.setState({ keyboardVisible: false })
  }
  render() {
    const { primaryButton, secondaryButton } = this.props
    const { keyboardVisible } = this.state

    return (
      <ButtonContainer style={{ marginBottom: keyboardVisible ? 18 : 36 }}>
        {secondaryButton && (
          <SSISecondaryButton
            title={secondaryButton.caption}
            onPress={secondaryButton.onPress}
            disabled={secondaryButton.disabled}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{ height: 42, minWidth: 145, width: primaryButton ? undefined : 300 }}
          />
        )}
        <Spacer />
        {primaryButton && (
          <SSIPrimaryButton
            title={primaryButton.caption}
            onPress={primaryButton.onPress}
            disabled={primaryButton.disabled}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{ height: 42, minWidth: 145, width: secondaryButton ? undefined : 300 }}
          />
        )}
      </ButtonContainer>
    )
  }
}

export default SSIButtonsContainer
