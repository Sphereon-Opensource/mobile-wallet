import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { InputDescriptorV1 } from '@sphereon/pex-models'
import React, { FC, useEffect, useState } from 'react'
import { ListRenderItemInfo } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { PEX, SelectResults } from '@sphereon/pex'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../@config/constants'
import SSICredentialRequiredViewItem from '../../components/views/SSICredentialRequiredViewItem'
import {
  SSIBasicContainerStyled as Container,
  SSICredentialsRequiredScreenButtonContainerStyled as ButtonContainer,
  SSIStatusBarDarkModeStyled as StatusBar
} from '../../styles/components'
import { ScreenRoutesEnum, StackParamList } from '../../types'
import {
  UniqueVerifiableCredential,
  VerifiableCredential,
} from '@veramo/core'
import { getVerifiableCredentialsFromStorage } from '../../services/credentialService'
import {
  IVerifiableCredential,
  OriginalVerifiableCredential
} from '@sphereon/ssi-types'
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer'
import { translate } from '../../localization/Localization'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_REQUIRED_OVERVIEW>;

const SSICredentialsRequiredScreen: FC<Props> = (props: Props): JSX.Element => {
  const { presentationDefinition } = props.route.params
  const [selectedCredentials, setSelectedCredentials] = useState(new Map<string, Array<VerifiableCredential>>())
  const [availableCredentials, setAvailableCredentials] = useState(new Map<string, Array<VerifiableCredential>>())
  const pex = new PEX()

  useEffect(() => {
    getVerifiableCredentialsFromStorage()
      .then((vcs: Array<UniqueVerifiableCredential>) => {
        const originalVcs: Array<OriginalVerifiableCredential> = vcs.map((vc: UniqueVerifiableCredential) => vc.verifiableCredential as OriginalVerifiableCredential)
        const credentials = new Map<string, Array<VerifiableCredential>>()
        presentationDefinition.input_descriptors.forEach((inputDescriptor: InputDescriptorV1) => {
          const presentationDefinition = {
            id: inputDescriptor.id,
            input_descriptors: [inputDescriptor]
          }
          const selectResult: SelectResults = pex.selectFrom(presentationDefinition, originalVcs)
          const matchedCredentials: Array<VerifiableCredential> = selectResult.verifiableCredential
            ? selectResult.verifiableCredential.map((vc: IVerifiableCredential) => vc as VerifiableCredential)
            : []
          credentials.set(inputDescriptor.id, matchedCredentials)
        })
        setAvailableCredentials(credentials);
      })
  }, []);

  useEffect(() => {
    const credentials = new Map<string, Array<VerifiableCredential>>()
    presentationDefinition.input_descriptors.forEach((inputDescriptor: InputDescriptorV1) => credentials.set(inputDescriptor.id, []))
    setSelectedCredentials(credentials);
  }, [presentationDefinition])

  const onDecline = async () => {
    props.navigation.goBack()
  }

  // TODO add support for multiple versions of pex, currently using V1
  const renderItem = (itemInfo: ListRenderItemInfo<InputDescriptorV1>): JSX.Element => {
    return (
      <SSICredentialRequiredViewItem
        id={itemInfo.item.id}
        title={itemInfo.item.name || itemInfo.item.id}
        available={availableCredentials.get(itemInfo.item.id) ? availableCredentials.get(itemInfo.item.id)! : []}
        selected={selectedCredentials.get(itemInfo.item.id) ? selectedCredentials.get(itemInfo.item.id)! : []}
        isMatching={false}
        listIndex={itemInfo.index}
        onPress={async () => console.log('required credential pressed')}
      />
    )
  }

  return (
    <Container>
      <StatusBar />
      <SwipeListView
        data={presentationDefinition.input_descriptors}
        keyExtractor={(itemInfo: InputDescriptorV1) => itemInfo.id}
        renderItem={renderItem}
        closeOnRowOpen
        closeOnRowBeginSwipe
        useFlatList
        initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
      />
      <ButtonContainer>
        <SSIButtonsContainer
          secondaryButton={{
            caption: translate('action_decline_label'),
            onPress: onDecline,
          }}
          primaryButton={{
            caption: translate('action_accept_label'),
            disabled: true,  // TODO implementation
            onPress: async () => console.log('accept pressed'),
          }}
        />
      </ButtonContainer>
    </Container>
  )
}

export default SSICredentialsRequiredScreen
