import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSICheckbox from '../../components/fields/SSICheckbox';
import SSITextInputField from '../../components/fields/SSITextInputField'
import { translate } from '../../localization/Localization'
import {
  SSIContactAddScreenDisclaimerCheckboxContainerStyled as CheckboxContainer,
  SSIContactAddScreenContainerStyled as Container,
  SSIContactAddScreenDisclaimerCaptionStyled as DisclaimerCaption,
  SSIContactAddScreenDisclaimerContainerStyled as DisclaimerContainer
} from '../../styles/components/screens/SSIContactAddScreen'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ADD>

const SSIContactAddScreen: FC<Props> = (props: Props): JSX.Element => {
  return (
      <Container>
        <SSITextInputField
            autoFocus={true}
            label={translate('contact_add_contact_name_label')}
            onChangeText={async (input: string) => {
              if (/\d/.test(input)) {
                return Promise.reject(Error('value is not a'))
              }
            }}
            placeholderValue={translate('contact_add_contact_name_placeholder')}
        />
        <DisclaimerContainer>
          <CheckboxContainer>
            <SSICheckbox/>
          </CheckboxContainer>
          <DisclaimerCaption>{translate('contact_add_disclaimer')}</DisclaimerCaption>
        </DisclaimerContainer>
      </Container>
  )
}

export default SSIContactAddScreen
