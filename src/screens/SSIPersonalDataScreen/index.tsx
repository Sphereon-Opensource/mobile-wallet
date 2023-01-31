import React, { PureComponent } from 'react'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'
import { connect } from 'react-redux'

import {
  EMAIL_ADDRESS_VALIDATION_REGEX,
  EMAIL_ADDRESS_MAX_LENGTH,
  FIRST_NAME_MAX_LENGTH,
  LAST_NAME_MAX_LENGTH
} from '../../@config/constants'
import { ScreenRoutesEnum, StackParamList } from '../../@types'
import { ISetPersonalDataActionArgs } from '../../@types/store/onboarding.types'
import { IUser } from '../../@types/store/user.types'
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer'
import SSITextInputField from '../../components/fields/SSITextInputField'
import { translate } from '../../localization/Localization'
import { setPersonalData } from '../../store/actions/onboarding.actions'
import { setUser } from '../../store/actions/user.actions'
import {
  SSIPersonalDataScreenContainerStyled as Container,
  SSIPersonalDataScreenTextInputContainerStyled as TextInputContainer,
  SSIPersonalDataScreenTextInputsContainerStyled as TextInputsContainer
} from '../../styles/components'

interface IScreenProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PERSONAL_DATA> {
  setPersonalData: (args: ISetPersonalDataActionArgs) => void
  setUser: (args: IUser) => void
}

interface IScreenState {
  firstName: string
  lastName: string
  emailAddress: string
}

class SSIPersonalDataScreen extends PureComponent<IScreenProps, IScreenState> {
  state = {
    firstName: '',
    lastName: '',
    emailAddress: '',
  }

  onFirstNameChange = async (input: string): Promise<void> => {
    this.setState({ firstName: input })
  }

  onFirstNameValidation = async (input: string): Promise<void> => {
    if (input.length === 0) {
      return Promise.reject(Error(translate('first_name_invalid_message')))
    }
  }

  onLastNameChange = async (input: string): Promise<void> => {
    this.setState({ lastName: input })
  }

  onLastNameValidation = async (input: string): Promise<void> => {
    if (input.length === 0) {
      return Promise.reject(Error(translate('last_name_invalid_message')))
    }
  }

  onEmailAddressChange = async (input: string): Promise<void> => {
    this.setState({ emailAddress: input.toLowerCase() })
  }

  onEmailAddressValidation = async (input: string): Promise<void> => {
    if (!EMAIL_ADDRESS_VALIDATION_REGEX.test(input)) {
      this.setState({ emailAddress: '' })
      return Promise.reject(Error(translate('email_address_invalid_message')))
    }
  }

  onNext = async (): Promise<void> => {
    const { firstName, lastName, emailAddress } = this.state

    this.props.setPersonalData({
      firstName,
      lastName,
      emailAddress
    })

    // TODO WAL-407 implement user functionality
    this.props.setUser({ name: 'dummy' })
  }

  render() {
    const { firstName, lastName, emailAddress } = this.state

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Container>
          <TextInputsContainer>
            <TextInputContainer>
              <SSITextInputField
                autoComplete={'name-given'}
                autoFocus={true}
                label={translate('first_name_label')}
                maxLength={FIRST_NAME_MAX_LENGTH}
                onChangeText={this.onFirstNameChange}
                onEndEditing={this.onFirstNameValidation}
                placeholderValue={translate('first_name_placeholder')}
              />
            </TextInputContainer>
            <TextInputContainer>
              <SSITextInputField
                autoComplete={'name-family'}
                label={translate('last_name_label')}
                maxLength={LAST_NAME_MAX_LENGTH}
                onChangeText={this.onLastNameChange}
                onEndEditing={this.onLastNameValidation}
                placeholderValue={translate('last_name_placeholder')}
              />
            </TextInputContainer>
            <SSITextInputField
              label={translate('email_address_label')}
              maxLength={EMAIL_ADDRESS_MAX_LENGTH}
              autoComplete={'email'}
              onChangeText={this.onEmailAddressChange}
              onEndEditing={this.onEmailAddressValidation}
              placeholderValue={translate('email_address_placeholder')}
            />
          </TextInputsContainer>
          <SSIButtonsContainer
            primaryButton={{
              caption: translate('action_next_label'),
              disabled: firstName.length === 0 || lastName.length === 0 || emailAddress.length === 0,
              onPress: this.onNext
            }}
          />
        </Container>
      </TouchableWithoutFeedback>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    setPersonalData: (args: ISetPersonalDataActionArgs) => dispatch(setPersonalData(args)),
    setUser: (args: IUser) => dispatch(setUser(args))
  }
}

export default connect(null, mapDispatchToProps)(SSIPersonalDataScreen)
