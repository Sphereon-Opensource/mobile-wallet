import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { PEX, SelectResults } from '@sphereon/pex'
import { InputDescriptorV1, InputDescriptorV2 } from '@sphereon/pex-models'
import {
  ICredential,
  IVerifiableCredential,
  OriginalVerifiableCredential
} from '@sphereon/ssi-types'
import {
  UniqueVerifiableCredential,
  VerifiableCredential,
} from '@veramo/core'
import React, { FC, useEffect, useState } from 'react'
import { ListRenderItemInfo } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../@config/constants'
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer'
import SSICredentialRequiredViewItem from '../../components/views/SSICredentialRequiredViewItem'
import { translate } from '../../localization/Localization'
import { getVerifiableCredentialsFromStorage } from '../../services/credentialService'
import {
  SSICredentialsRequiredScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSIStatusBarDarkModeStyled as StatusBar
} from '../../styles/components'
import { ScreenRoutesEnum, StackParamList } from '../../types'
import {toCredentialSummary} from '../../utils/mappers/CredentialMapper';
import { Status } from '@sphereon/pex/dist/main/lib/ConstraintUtils'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_REQUIRED>;

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
        presentationDefinition.input_descriptors.forEach((inputDescriptor: InputDescriptorV1 | InputDescriptorV2) => {
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
    presentationDefinition.input_descriptors.forEach((inputDescriptor: InputDescriptorV1 | InputDescriptorV2) => credentials.set(inputDescriptor.id, []))
    setSelectedCredentials(credentials);
  }, [presentationDefinition])

  const onDecline = async () => {
    props.navigation.goBack()
  }

  const onItemPress = async (inputDescriptorId: string, credentials: Array<VerifiableCredential>) => {
    props.navigation.navigate(ScreenRoutesEnum.CREDENTIALS_SELECT, {
      credentialSelection: credentials.map((vc: VerifiableCredential) => {
        const credentialSummary = toCredentialSummary(vc as ICredential)
        return {
          id: credentialSummary.id,
          credential: credentialSummary,
          rawCredential: vc,
          isSelected: selectedCredentials.get(inputDescriptorId)!.some((vc: VerifiableCredential) => vc.id! === credentialSummary.id)
        }
      }),
      // TODO move this to a function, would be nicer
      onSelect: async (vcs: Array<string>) => {
        const selectVcs = availableCredentials.get(inputDescriptorId)!.filter((vc: VerifiableCredential) => vcs.includes(vc.id!))
        selectedCredentials.set(inputDescriptorId, selectVcs)
        const map = new Map<string, Array<VerifiableCredential>>();
        for (const [key, value] of selectedCredentials) {
          map.set(key, value);
        }
        setSelectedCredentials(map)
      }
    })
  }

  // TODO add support for multiple versions of pex, currently using V1
  const renderItem = (itemInfo: ListRenderItemInfo<InputDescriptorV1 | InputDescriptorV2>): JSX.Element => {
    return (
      <SSICredentialRequiredViewItem
        id={itemInfo.item.id}
        title={itemInfo.item.name || itemInfo.item.id}
        available={availableCredentials.has(itemInfo.item.id) ? availableCredentials.get(itemInfo.item.id)! : []}
        selected={selectedCredentials.has(itemInfo.item.id) ? selectedCredentials.get(itemInfo.item.id)! : []}
        isMatching={selectedCredentials.has(itemInfo.item.id)
          ? pex.evaluateCredentials(
          {
              id: itemInfo.item.id,
              input_descriptors: [itemInfo.item]
            }, selectedCredentials.get(itemInfo.item.id)!.map((vc: VerifiableCredential) => vc as OriginalVerifiableCredential)
          ).areRequiredCredentialsPresent === Status.INFO
          : false
        }
        listIndex={itemInfo.index}
        onPress={() => onItemPress(itemInfo.item.id, availableCredentials.get(itemInfo.item.id)!)}
      />
    )
  }

  return (
    <Container>
      <StatusBar />
      <SwipeListView
        data={presentationDefinition.input_descriptors}
        keyExtractor={(itemInfo: InputDescriptorV1 | InputDescriptorV2) => itemInfo.id}
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
