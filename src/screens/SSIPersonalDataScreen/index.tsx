import React, { FC, useState } from 'react'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'
import { useDispatch } from 'react-redux'

import { EMAIL_ADDRESS_VALIDATION_REGEX } from '../../@config/constants'
import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer'
import SSITextInputField from '../../components/fields/SSITextInputField'
import { translate } from '../../localization/Localization'
import {
  SSIPersonalDataScreenContainerStyled as Container,
  SSIPersonalDataScreenTextInputContainerStyled as TextInputContainer
} from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PERSONAL_DATA>

const SSIPersonalDataScreen: FC<Props> = (props: Props): JSX.Element => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')

  const dispatch = useDispatch()

  const onFirstNameChange = async (input: string): Promise<void> => {
    setFirstName(input)
  }

  const onFirstNameValidation = async (input: string): Promise<void> => {
    if (firstName.length === 0) {
      return Promise.reject(Error(translate('first_name_invalid_message')))
    }
  }

  const onLastNameChange = async (input: string): Promise<void> => {
    setLastName(input)
  }

  const onLastNameValidation = async (input: string): Promise<void> => {
    if (lastName.length === 0) {
      return Promise.reject(Error(translate('last_name_invalid_message')))
    }
  }

  const onEmailAddressChange = async (input: string): Promise<void> => {
    setEmailAddress(input.toLowerCase())
  }

  const onEmailAddressValidation = async (input: string): Promise<void> => {
    if (!EMAIL_ADDRESS_VALIDATION_REGEX.test(input)) {
      setEmailAddress('')
      return Promise.reject(Error(translate('email_address_invalid_message')))
    }
  }

  const onContinue = async (): Promise<void> => {
    console.log('pressed')
    // TODO WAL-407 implement user functionality
    //dispatch(setUser({ name: 'dummy' }))
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Container>
        <TextInputContainer>
          <SSITextInputField
            autoFocus={true}
            label={translate('first_name_label')}
            // maxLength={MAX_CONTACT_ALIAS_LENGTH}
            onChangeText={onFirstNameChange}
            onEndEditing={onFirstNameValidation}
            placeholderValue={translate('first_name_placeholder')}
          />
          <SSITextInputField
            label={translate('last_name_label')}
            // maxLength={MAX_CONTACT_ALIAS_LENGTH}
            onChangeText={onLastNameChange}
            onEndEditing={onLastNameValidation}
            placeholderValue={translate('last_name_placeholder')}
          />
          <SSITextInputField
            label={translate('email_address_label')}
            // maxLength={MAX_CONTACT_ALIAS_LENGTH}
            onChangeText={onEmailAddressChange}
            onEndEditing={onEmailAddressValidation}
            placeholderValue={translate('email_address_placeholder')}
          />
        </TextInputContainer>
        <SSIButtonsContainer
          primaryButton={{
            caption: 'Continue',
            disabled: firstName.length === 0 || lastName.length === 0 || emailAddress.length === 0,
            onPress: onContinue
          }}
        />
      </Container>
    </TouchableWithoutFeedback>
  )
}

export default SSIPersonalDataScreen
