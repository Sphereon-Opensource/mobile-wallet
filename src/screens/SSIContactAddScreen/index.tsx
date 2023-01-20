import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton'
import SSISecondaryButton from '../../components/buttons/SSISecondaryButton'
import SSICheckbox from '../../components/fields/SSICheckbox';
import SSITextInputField from '../../components/fields/SSITextInputField'
import { translate } from '../../localization/Localization'
import {
  SSIContactAddScreenDisclaimerCheckboxContainerStyled as CheckboxContainer,
  SSIContactAddScreenContainerStyled as Container,
  SSIContactAddScreenDisclaimerCaptionStyled as DisclaimerCaption,
  SSIContactAddScreenDisclaimerContainerStyled as DisclaimerContainer
} from '../../styles/components/screens/SSIContactAddScreen'
import {
  SSIButtonBottomMultipleContainerStyled as ButtonContainer,
  SSIPexVerificationSpacerStyled as Spacer
} from '../../styles/styledComponents'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ADD>

const SSIContactAddScreen: FC<Props> = (props: Props): JSX.Element => {
  const [contactName, setContactName] = React.useState<string>()
  const [consent, setConsent] = React.useState(false)

  return (
      <Container>
        <SSITextInputField
            autoFocus={true}
            label={translate('contact_add_contact_name_label')}
            onChangeText={async (input: string) => {
              setContactName(input)
              if (/\d/.test(input)) {
                return Promise.reject(Error(translate('contact_add_contact_name_invalid_message')))
              }
            }}
            placeholderValue={translate('contact_add_contact_name_placeholder')}
        />
        <DisclaimerContainer>
          <CheckboxContainer>
            <SSICheckbox onValueChange={async (isChecked: boolean) => setConsent(isChecked)}/>
          </CheckboxContainer>
          <DisclaimerCaption>{translate('contact_add_disclaimer')}</DisclaimerCaption>
        </DisclaimerContainer>
        <ButtonContainer>
          <SSISecondaryButton
              title={translate('action_decline_label')}
              onPress={() => props.navigation.goBack()}
              // TODO move styling to styledComponents (currently there is an issue where this styling prop is not being set correctly)
              style={{ height: 42, width: 145 }}
          />
          <Spacer />
          <SSIPrimaryButton
              title={translate('action_accept_label')}
              onPress={() => console.log('accept')}
              disabled={!consent || (contactName === undefined || contactName === '')}
              // TODO move styling to styledComponents (currently there is an issue where this styling prop is not being set correctly)
              style={{ height: 42, width: 145 }}
          />
        </ButtonContainer>
      </Container>
  )
}

export default SSIContactAddScreen
