import React, { PureComponent } from 'react'
import { EmitterSubscription, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'
import { connect } from 'react-redux'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import { ICreateContactArgs } from '../../@types/store/contact.action.types'
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton'
import SSISecondaryButton from '../../components/buttons/SSISecondaryButton'
import SSICheckbox from '../../components/fields/SSICheckbox'
import SSITextInputField from '../../components/fields/SSITextInputField'
import { translate } from '../../localization/Localization'
import { getContacts } from '../../services/contactService'
import { createContact as StoreContact } from '../../store/actions/contact.actions'
import {
  SSIButtonBottomMultipleContainerStyled as ButtonContainer,
  SSIContactAddScreenDisclaimerCheckboxContainerStyled as CheckboxContainer,
  SSIContactAddScreenContainerStyled as Container,
  SSIContactAddScreenDisclaimerCaptionStyled as DisclaimerCaption,
  SSIContactAddScreenDisclaimerContainerStyled as DisclaimerContainer,
  SSIButtonSpacerStyled as Spacer,
  SSIStatusBarDarkModeStyled as StatusBar
} from '../../styles/components'

interface IScreenProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ADD> {
  createContact: (args: ICreateContactArgs) => void
}

class SSIContactAddScreen extends PureComponent<IScreenProps> {
  keyboardDidShowListener: EmitterSubscription
  keyboardDidHideListener: EmitterSubscription
  state = {
    contactAlias: undefined,
    hasConsent: true,
    isInvalidContactAlias: false,
    keyboardVisible: true
  }

  componentDidMount = () => {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
  }

  _keyboardDidShow = () => {
    this.setState({ keyboardVisible: true })
  }

  _keyboardDidHide = () => {
    this.setState({ keyboardVisible: false })
  }

  onValidate = async (input: string | undefined): Promise<void> => {
    if (input === undefined || input.length === 0) {
      this.setState({ isInvalidContactAlias: true })
      return Promise.reject(Error(translate('contact_add_contact_name_invalid_message')))
    }

    const contacts = await getContacts({ filter: [{ alias: input }] })
    if (contacts.length !== 0) {
      this.setState({ isInvalidContactAlias: true })
      return Promise.reject(Error(translate('contact_add_contact_name_unavailable_message')))
    }

    this.setState({ isInvalidContactAlias: false })
  }

  onCreate = async (): Promise<void> => {
    const { name, uri, identifier, onCreate } = this.props.route.params
    const { contactAlias } = this.state

    Keyboard.dismiss()

    await this.onValidate(contactAlias)
      .then(() => {
        this.props.createContact({
          name,
          alias: contactAlias!,
          uri,
          identifier
        })

        onCreate()
      })
      .catch((error: Error) => {
        // do nothing as the state is already handled by the validate function, and we do not want to create the contact
      })
  }

  render() {
    const { contactAlias, hasConsent, isInvalidContactAlias, keyboardVisible } = this.state

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Container>
          <StatusBar />
          <SSITextInputField
            autoFocus={true}
            label={translate('contact_add_contact_name_label')}
            maxLength={50}
            onChangeText={async (input: string) => this.setState({ contactAlias: input, isInvalidContactAlias: false })}
            onEndEditing={this.onValidate}
            placeholderValue={translate('contact_add_contact_name_placeholder')}
          />
          <DisclaimerContainer>
            <CheckboxContainer>
              <SSICheckbox
                initialValue
                onValueChange={async (isChecked: boolean) => this.setState({ hasConsent: isChecked })}
              />
            </CheckboxContainer>
            <DisclaimerCaption>{translate('contact_add_disclaimer')}</DisclaimerCaption>
          </DisclaimerContainer>
          {/* TODO bottom styling is general button container behavior that should be applied to the container itself */}
          <ButtonContainer style={{ bottom: keyboardVisible ? 18 : 37 }}>
            <SSISecondaryButton
              title={translate('action_decline_label')}
              onPress={() => this.props.navigation.goBack()}
              // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
              style={{ height: 42, width: 145 }}
            />
            <Spacer />
            <SSIPrimaryButton
              title={translate('action_accept_label')}
              onPress={this.onCreate}
              disabled={!hasConsent || contactAlias === undefined || contactAlias === '' || isInvalidContactAlias}
              // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
              style={{ height: 42, width: 145 }}
            />
          </ButtonContainer>
        </Container>
      </TouchableWithoutFeedback>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    createContact: (args: ICreateContactArgs) => dispatch(StoreContact(args))
  }
}

export default connect(null, mapDispatchToProps)(SSIContactAddScreen)
