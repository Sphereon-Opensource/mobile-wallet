import { PresentationDefinitionWithLocation } from '@sphereon/did-auth-siop/dist/main/types/SIOP.types'
import { ConnectionTypeEnum } from '@sphereon/ssi-sdk-data-store-common'
import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIBackgroundImage from '../../assets/images/connections.svg'
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton'
import SSISecondaryButton from '../../components/buttons/SSISecondaryButton'
import { translate } from '../../localization/Localization'
import { verifyAuthentication } from '../../services/authenticationService'
import {
  SSIButtonBottomMultipleContainerStyled as ButtonContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIPEXVerificationScreenBackgroundImageContainerStyled as ImageContainer,
  SSIPEXVerificationScreenMessageStyled as Message,
  SSIPEXVerificationScreenMessageContainerStyled as MessagesContainer,
  SSIPEXVerificationScreenMessageTitleStyled as MessageTitle,
  SSIPEXVerificationScreenSpacerStyled as Spacer
} from '../../styles/components'
import { showToast, ToastTypeEnum } from '../../utils/ToastUtils'

const { v4: uuidv4 } = require('uuid')
type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PEX_VERIFICATION>

const SSIPEXVerificationScreen: FC<Props> = (props: Props): JSX.Element => {
  const onAccept = () => {
    verifyAuthentication(ConnectionTypeEnum.DIDAUTH, {
      sessionId: props.route.params.sessionId,
      verifiedAuthenticationRequest: props.route.params.request
    })
      .then(() => {
        props.navigation.navigate(ScreenRoutesEnum.CREDENTIALS_OVERVIEW, {})
        showToast(ToastTypeEnum.TOAST_SUCCESS, translate('authentication_successful_message'))
      })
      .catch((error: Error) => showToast(ToastTypeEnum.TOAST_SUCCESS, error.message)) // TODO make human readable message
  }

  return (
    <Container>
      <ImageContainer>
        <SSIBackgroundImage />
      </ImageContainer>
      <MessageTitle>{translate('pex_message_title')}</MessageTitle>
      <MessagesContainer>
        {props.route.params.request.presentationDefinitions?.map((definition: PresentationDefinitionWithLocation) => (
          <Message key={uuidv4()}>{definition.definition.purpose}</Message>
        ))}
      </MessagesContainer>
      <ButtonContainer>
        <SSISecondaryButton
          title={translate('action_decline_label')}
          onPress={() => props.navigation.goBack()}
          // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
          style={{ height: 42, width: 145 }}
        />
        <Spacer />
        <SSIPrimaryButton
          title={translate('action_accept_label')}
          onPress={() => onAccept()}
          // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
          style={{ height: 42, width: 145 }}
        />
      </ButtonContainer>
    </Container>
  )
}

export default SSIPEXVerificationScreen
