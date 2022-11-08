import { PresentationDefinitionWithLocation } from '@sphereon/did-auth-siop/dist/main/types/SIOP.types'
import { ConnectionTypeEnum } from '@sphereon/ssi-sdk-data-store-common'
import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types'

import { HomeRoutesEnum, QrRoutesEnum, StackParamList } from '../../@types'
import SSIBackgroundImage from '../../assets/images/connections.svg'
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton'
import SSISecondaryButton from '../../components/buttons/SSISecondaryButton'
import { translate } from '../../localization/Localization'
import { verifyAuthentication } from '../../services/authenticationService'
import {
  SSIButtonBottomMultipleContainerStyled as ButtonContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIPexBackgroundImageContainerStyled as ImageContainer,
  SSIPexMessageStyled as Message,
  SSIPexMessageContainerStyled as MessagesContainer,
  SSIPexMessageTitleStyled as MessageTitle,
  SSIPexVerificationSpacerStyled as Spacer
} from '../../styles/styledComponents'
import { showToast, ToastTypeEnum } from '../../utils/ToastUtils'

const { v4: uuidv4 } = require('uuid')
type Props = NativeStackScreenProps<StackParamList, QrRoutesEnum.PEX_VERIFICATION>

const SSIPEXVerificationScreen: FC<Props> = (props: Props): JSX.Element => {
  const onAccept = () => {
    verifyAuthentication(ConnectionTypeEnum.DIDAUTH, {
      sessionId: props.route.params.sessionId,
      verifiedAuthenticationRequest: props.route.params.request
    })
      .then(() => {
        props.navigation.navigate(HomeRoutesEnum.CREDENTIALS_OVERVIEW, {})
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
          // TODO move styling to styledComponents (currently there is an issue where this styling prop is not being set correctly)
          style={{ height: 42, width: 145 }}
        />
        <Spacer />
        <SSIPrimaryButton
          title={translate('action_accept_label')}
          onPress={() => onAccept()}
          // TODO move styling to styledComponents (currently there is an issue where this styling prop is not being set correctly)
          style={{ height: 42, width: 145 }}
        />
      </ButtonContainer>
    </Container>
  )
}

export default SSIPEXVerificationScreen
