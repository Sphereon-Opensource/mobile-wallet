import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { PureComponent } from 'react'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux'

import { CONTACT_ALIAS_MAX_LENGTH } from '../../@config/constants'
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer'
import SSICheckbox from '../../components/fields/SSICheckbox'
import SSITextInputField from '../../components/fields/SSITextInputField'
import { translate } from '../../localization/Localization'
import { getContacts } from '../../services/contactService'
import { createContact as StoreContact } from '../../store/actions/contact.actions'
import {
  SSIContactAddScreenContainerStyled as Container,
  SSIContactAddScreenDisclaimerContainerStyled as DisclaimerContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
  SSIContactAddScreenTextInputContainerStyled as TextInputContainer
} from '../../styles/components'
import { MainRoutesEnum, ScreenRoutesEnum, StackParamList, ToastTypeEnum } from '../../types'
import { ICreateContactArgs } from '../../types/store/contact.action.types'
import { showToast } from '../../utils/ToastUtils'

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ADD> {
  createContact: (args: ICreateContactArgs) => void
}

interface IState {
  contactAlias: string
  hasConsent: boolean
}

class SSIContactAddScreen extends PureComponent<IProps, IState> {
  state: IState = {
    contactAlias: '',
    hasConsent: true
  }

  onValidate = async (value: string): Promise<void> => {
    let contactAlias: string = value
    contactAlias = contactAlias.trim()

    if (contactAlias.length === 0) {
      this.setState({ contactAlias: '' })
      return Promise.reject(Error(translate('contact_name_invalid_message')))
    }

    const contacts = await getContacts({ filter: [{ alias: contactAlias }] })
    if (contacts.length !== 0) {
      this.setState({ contactAlias: '' })
      return Promise.reject(Error(translate('contact_name_unavailable_message')))
    }
  }

  onCreate = async (): Promise<void> => {
    const { name, uri, onCreate } = this.props.route.params
    const { contactAlias } = this.state

    Keyboard.dismiss()

    this.onValidate(contactAlias)
      .then(() => {
        this.props.createContact({
          name,
          alias: contactAlias.trim(),
          uri,
        })
        onCreate()
      })
      .catch(() => {
        // do nothing as the state is already handled by the validate function, and we do not want to create the contact
      })
  }

  onChangeText = async (value: string): Promise<void> => {
    this.setState({ contactAlias: value })
  }

  onValueChange = async (isChecked: boolean): Promise<void> => {
    this.setState({ hasConsent: isChecked })
    if (!isChecked) {
      showToast(ToastTypeEnum.TOAST_ERROR, translate('contact_add_no_consent_toast'))
    }
  }

  onDecline = async (): Promise<void> => {
    Keyboard.dismiss()
    this.props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('contact_add_cancel_title'),
      details: translate('contact_add_cancel_message'),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async () => this.props.navigation.navigate(ScreenRoutesEnum.QR_READER, {})
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        // TODO fix navigation WAL-405
        onPress: async () => this.props.navigation.goBack()
      }
    })
  }

  render() {
    const { contactAlias, hasConsent } = this.state

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Container>
          <StatusBar />
          <TextInputContainer>
            <SSITextInputField
              autoFocus={true}
              label={translate('contact_name_label')}
              maxLength={CONTACT_ALIAS_MAX_LENGTH}
              onChangeText={this.onChangeText}
              onEndEditing={this.onValidate}
              placeholderValue={translate('contact_name_placeholder')}
            />
          </TextInputContainer>
          <DisclaimerContainer>
            <SSICheckbox initialValue label={translate('contact_add_disclaimer')} onValueChange={this.onValueChange} />
          </DisclaimerContainer>
          <SSIButtonsContainer
            secondaryButton={{
              caption: translate('action_decline_label'),
              onPress: this.onDecline
            }}
            primaryButton={{
              caption: translate('action_accept_label'),
              disabled: !hasConsent || contactAlias.length === 0,
              onPress: this.onCreate
            }}
          />
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
