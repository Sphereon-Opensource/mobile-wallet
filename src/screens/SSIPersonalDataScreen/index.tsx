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
  SSIPersonalDataScreenTextInputsContainerStyled as TextInputsContainer,
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

  const onNext = async (): Promise<void> => {
    console.log('pressed')
    // TODO WAL-407 implement user functionality
    //dispatch(setUser({ name: 'dummy' }))
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Container>
        <TextInputsContainer>
          <TextInputContainer>
            <SSITextInputField
              autoComplete={'name-given'}
              autoFocus={true}
              label={translate('first_name_label')}
              // maxLength={MAX_CONTACT_ALIAS_LENGTH}
              onChangeText={onFirstNameChange}
              onEndEditing={onFirstNameValidation}
              placeholderValue={translate('first_name_placeholder')}
            />
          </TextInputContainer>
          <TextInputContainer>
            <SSITextInputField
              autoComplete={'name-family'}
              label={translate('last_name_label')}
              // maxLength={MAX_CONTACT_ALIAS_LENGTH}
              onChangeText={onLastNameChange}
              onEndEditing={onLastNameValidation}
              placeholderValue={translate('last_name_placeholder')}
            />
          </TextInputContainer>
          <SSITextInputField
            label={translate('email_address_label')}
            // maxLength={MAX_CONTACT_ALIAS_LENGTH}
            autoComplete={'email'}
            onChangeText={onEmailAddressChange}
            onEndEditing={onEmailAddressValidation}
            placeholderValue={translate('email_address_placeholder')}
          />
        </TextInputsContainer>
        <SSIButtonsContainer
          primaryButton={{
            caption: translate('action_next_label'),
            disabled: firstName.length === 0 || lastName.length === 0 || emailAddress.length === 0,
            onPress: onNext
          }}
        />
      </Container>
    </TouchableWithoutFeedback>
  )
}

export default SSIPersonalDataScreen
