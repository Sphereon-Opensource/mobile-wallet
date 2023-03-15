import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { PresentationDefinitionWithLocation } from '@sphereon/did-auth-siop'
import { ConnectionTypeEnum } from '@sphereon/ssi-sdk-data-store'
import React, { FC } from 'react'

import SSIConnectionsImage from '../../components/assets/images/SSIConnectionsImage'
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer'
import { translate } from '../../localization/Localization'
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIPEXVerificationScreenBackgroundImageContainerStyled as ImageContainer,
  SSIPEXVerificationScreenMessageContainerStyled as MessagesContainer,
  SSIPEXVerificationScreenMessageStyled as Message,
  SSIPEXVerificationScreenMessageTitleStyled as MessageTitle
} from '../../styles/components'
import {NavigationBarRoutesEnum, ScreenRoutesEnum, StackParamList, ToastTypeEnum} from '../../types'
import { showToast } from '../../utils/ToastUtils'
import { siopSendAuthorizationResponse } from '../../providers/authentication/SIOPv2Provider'

const { v4: uuidv4 } = require('uuid')

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.PEX_VERIFICATION>

const SSIPEXVerificationScreen: FC<Props> = (props: Props): JSX.Element => {
  const onAccept = async (): Promise<void> => {
    siopSendAuthorizationResponse(ConnectionTypeEnum.SIOPV2_OIDC4VP, {
      sessionId: props.route.params.sessionId
    })
      .then(() => {
        props.navigation.navigate(NavigationBarRoutesEnum.CREDENTIALS, {
            screen: ScreenRoutesEnum.CREDENTIALS_OVERVIEW
        })
        showToast(ToastTypeEnum.TOAST_SUCCESS, translate('authentication_successful_message'))
      })
      .catch((error: Error) => {
        console.error(error)
        showToast(ToastTypeEnum.TOAST_ERROR, error.message)
      }) // TODO make human readable message
  }

  const onDecline = async (): Promise<void> => {
    props.navigation.goBack()
  }

  return (
    <Container>
      <ImageContainer>
        <SSIConnectionsImage />
      </ImageContainer>
      <MessageTitle>{translate('pex_message_title')}</MessageTitle>
      <MessagesContainer>
        {props.route.params.request.presentationDefinitions?.map((pdl: PresentationDefinitionWithLocation) => (
          <Message key={uuidv4()}>
            {pdl.definition.purpose ??
              (Array.isArray(pdl.definition?.input_descriptors)
                ? pdl.definition.input_descriptors[0].purpose
                : 'Definition did not provide a purpose. Please make sure you trust the Relying Party')}
          </Message>
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
