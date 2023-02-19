import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { FC } from 'react'
import { FlatList, ListRenderItemInfo } from 'react-native'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../@config/constants'
import { ICredentialTypeSelection, ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton'
import SSICredentialSelectTypeViewItem from '../../components/views/SSICredentialSelectTypeViewItem'
import { translate } from '../../localization/Localization'
import { backgrounds } from '../../styles/colors'
import {
  SSICredentialSelectTypeScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSICredentialSelectTypeScreenViewItemContainerStyled as ItemContainer,
  SSIStatusBarDarkModeStyled as StatusBar
} from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE>

const SSICredentialSelectTypeScreen: FC<Props> = (props: Props): JSX.Element => {
  const [credentialTypes, setCredentialTypes] = React.useState(props.route.params.credentialTypes)

  const onAccept = async (): Promise<void> => {
    await props.route.params.onAccept(
      credentialTypes
        .filter((credentialTypeSelection: ICredentialTypeSelection) => credentialTypeSelection.isSelected)
        .map((credentialType: ICredentialTypeSelection) => credentialType.credentialType)
    )
  }

  const renderItem = (itemInfo: ListRenderItemInfo<ICredentialTypeSelection>): JSX.Element => (
    <ItemContainer
      style={{
        backgroundColor: itemInfo.index % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark
      }}
      onPress={() => {
        const index = credentialTypes.findIndex(
          (credentialType: ICredentialTypeSelection) => credentialType.id == itemInfo.item.id
        )
        credentialTypes[index].isSelected = !itemInfo.item.isSelected
        // Creating a copy of the array as React-Native does not see a difference between the new and old array if a value is changed on one of the objects, and therefor will not trigger a rerender
        setCredentialTypes([...credentialTypes])
      }}
    >
      <SSICredentialSelectTypeViewItem
        id={itemInfo.item.id}
        title={itemInfo.item.credentialType}
        isSelected={itemInfo.item.isSelected}
        style={{ backgroundColor: itemInfo.index % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark }}
      />
    </ItemContainer>
  )

  return (
    <Container>
      <StatusBar />
      <FlatList
        data={credentialTypes}
        renderItem={renderItem}
        keyExtractor={(itemInfo: ICredentialTypeSelection) => itemInfo.id}
        initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
      />
      <ButtonContainer>
        <SSIPrimaryButton
          style={{ height: 42, width: '100%' }}
          title={translate('action_accept_label')}
          onPress={onAccept}
          disabled={!credentialTypes.some((credentialType: ICredentialTypeSelection) => credentialType.isSelected)}
        />
      </ButtonContainer>
    </Container>
  )
}

export default SSICredentialSelectTypeScreen
