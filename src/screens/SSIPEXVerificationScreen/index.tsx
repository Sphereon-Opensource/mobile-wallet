import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { PresentationDefinitionWithLocation } from '@sphereon/did-auth-siop'
import { ConnectionTypeEnum } from '@sphereon/ssi-sdk-data-store-common'
import React, { FC } from 'react'

import SSIBackgroundImage from '../../assets/images/connections.svg'
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer'
import { translate } from '../../localization/Localization'
import { verifyAuthentication } from '../../services/authenticationService'
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIPEXVerificationScreenBackgroundImageContainerStyled as ImageContainer,
  SSIPEXVerificationScreenMessageStyled as Message,
  SSIPEXVerificationScreenMessageContainerStyled as MessagesContainer,
  SSIPEXVerificationScreenMessageTitleStyled as MessageTitle
} from '../../styles/components'
import { ScreenRoutesEnum, StackParamList, ToastTypeEnum } from '../../types'
import { showToast } from '../../utils/ToastUtils'

const { v4: uuidv4 } = require('uuid')

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PEX_VERIFICATION>

const SSIPEXVerificationScreen: FC<Props> = (props: Props): JSX.Element => {
  const onAccept = async (): Promise<void> => {
    verifyAuthentication(ConnectionTypeEnum.DIDAUTH, {
      sessionId: props.route.params.sessionId,
      verifiedAuthorizationRequest: props.route.params.request
    })
      .then(() => {
        props.navigation.navigate(ScreenRoutesEnum.CREDENTIALS_OVERVIEW, {})
        showToast(ToastTypeEnum.TOAST_SUCCESS, translate('authentication_successful_message'))
      })
      .catch((error: Error) => showToast(ToastTypeEnum.TOAST_SUCCESS, error.message)) // TODO make human readable message
  }

  const onDecline = async (): Promise<void> => {
    props.navigation.goBack()
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
      <SSIButtonsContainer
        secondaryButton={{
          caption: translate('action_decline_label'),
          onPress: onDecline
        }}
        primaryButton={{
          caption: translate('action_accept_label'),
          onPress: onAccept
        }}
      />
    </Container>
  )
}

export default SSIPEXVerificationScreen
