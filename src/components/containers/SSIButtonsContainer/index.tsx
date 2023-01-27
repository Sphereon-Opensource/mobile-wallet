import React, { PureComponent } from 'react'
import { EmitterSubscription, Keyboard } from 'react-native'

import { IButton } from '../../../@types'
import {
  SSIButtonBottomMultipleContainerStyled as ButtonContainer,
  SSIBasicHorizontalCenterContainerStyled as CenterContainer,
  SSIButtonsContainerSpacerStyled as Spacer
} from '../../../styles/components'
import SSIPrimaryButton from '../../buttons/SSIPrimaryButton'
import SSISecondaryButton from '../../buttons/SSISecondaryButton'

export interface Props {
  primaryButton?: IButton
  secondaryButton?: IButton
}

interface IScreenState {
  keyboardVisible: boolean
}

class SSIButtonsContainer extends PureComponent<Props, IScreenState> {
  keyboardDidShowListener: EmitterSubscription
  keyboardDidHideListener: EmitterSubscription
  state = {
    keyboardVisible: true
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

    // TODO style={{bottom: 30}}  style={{bottom: 30}}
    return (
      <CenterContainer style={{ marginBottom: keyboardVisible ? 18 : 36 }}>
        <ButtonContainer>
          { secondaryButton && (
            <SSISecondaryButton
              title={secondaryButton.caption}
              onPress={secondaryButton.onPress}
              disabled={secondaryButton.disabled}
              // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
              style={{ height: 42, width: 145 }}
            />
          )}
          <Spacer />
          { primaryButton && (
            <SSIPrimaryButton
              title={primaryButton.caption}
              onPress={primaryButton.onPress}
              disabled={primaryButton.disabled}
              // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
              style={{ height: 42, width: 145 }}
            />
          )}
        </ButtonContainer>
      </CenterContainer>
    )
  }
}

export default SSIButtonsContainer
