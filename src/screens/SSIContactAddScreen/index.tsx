import React, { PureComponent } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'
import { connect } from 'react-redux'

import { CONTACT_NAME_VALIDATION_REGEX } from '../../@config/constants'
import { ScreenRoutesEnum, StackParamList } from '../../@types'
import { ICreateContactArgs } from '../../@types/store/contact.action.types'
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton'
import SSISecondaryButton from '../../components/buttons/SSISecondaryButton'
import SSICheckbox from '../../components/fields/SSICheckbox'
import SSITextInputField from '../../components/fields/SSITextInputField'
import { translate } from '../../localization/Localization'
import { createContact } from '../../store/actions/contact.actions'
import {
  SSIButtonBottomMultipleContainerStyled as ButtonContainer,
  SSIContactAddScreenDisclaimerCheckboxContainerStyled as CheckboxContainer,
  SSIContactAddScreenContainerStyled as Container,
  SSIContactAddScreenDisclaimerCaptionStyled as DisclaimerCaption,
  SSIContactAddScreenDisclaimerContainerStyled as DisclaimerContainer,
  SSIPEXVerificationScreenSpacerStyled as Spacer // TODO
} from '../../styles/components'

interface IScreenProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ADD> {
  createContact: (args: ICreateContactArgs) => void
}

class SSIContactAddScreen extends PureComponent<IScreenProps> {
  state = {
    contactName: undefined,
    hasConsent: false,
    isInvalidContactName: false
  }

  render() {
    const { contactName, hasConsent, isInvalidContactName } = this.state

    return (
      <Container>
        <SSITextInputField
          autoFocus={true}
          label={translate('contact_add_contact_name_label')}
          onChangeText={async (input: string) => {
            if (!CONTACT_NAME_VALIDATION_REGEX.test(input)) {
              this.setState({ ...this.state, contactName: input, isInvalidContactName: true })
              return Promise.reject(Error(translate('contact_add_contact_name_invalid_message')))
            }
            this.setState({ ...this.state, contactName: input, isInvalidContactName: false })
          }}
          placeholderValue={translate('contact_add_contact_name_placeholder')}
        />
        <DisclaimerContainer>
          <CheckboxContainer>
            <SSICheckbox
              onValueChange={async (isChecked: boolean) => this.setState({ ...this.state, hasConsent: isChecked })}
            />
          </CheckboxContainer>
          <DisclaimerCaption>{translate('contact_add_disclaimer')}</DisclaimerCaption>
        </DisclaimerContainer>
        <ButtonContainer>
          <SSISecondaryButton
            title={translate('action_decline_label')}
            onPress={() => this.props.navigation.goBack()}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{ height: 42, width: 145 }}
          />
          <Spacer />
          <SSIPrimaryButton
            title={translate('action_accept_label')}
            onPress={() => console.log('accept')}
            disabled={!hasConsent || contactName === undefined || contactName === '' || isInvalidContactName}
            // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
            style={{ height: 42, width: 145 }}
          />
        </ButtonContainer>
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    createContact: (args: ICreateContactArgs) => dispatch(createContact(args))
  }
}

export default connect(null, mapDispatchToProps)(SSIContactAddScreen)
