import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { FC } from 'react'
import { ListRenderItemInfo } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

import { OVERVIEW_INITIAL_NUMBER_TO_RENDER } from '../../@config/constants'
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer'
import { translate } from '../../localization/Localization'
import { backgrounds } from '../../styles/colors'
import {
  SSICredentialsRequiredScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSICredentialSelectTypeScreenViewItemContainerStyled as ItemContainer,
  SSIStatusBarDarkModeStyled as StatusBar
} from '../../styles/components'
import {
  ICredentialSelection,
  ScreenRoutesEnum,
  StackParamList
} from '../../types'
import SSICredentialSelectViewItem from '../../components/views/SSICredentialSelectViewItem'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_SELECT>;

const SSICredentialsSelectScreen: FC<Props> = (props: Props): JSX.Element => {
  const { onSelect } = props.route.params
  const [credentialSelection, setCredentialSelection] = React.useState(props.route.params.credentialSelection);

  const onLongPress = async (itemInfo: ListRenderItemInfo<ICredentialSelection>): Promise<void> => {
    const index = credentialSelection.findIndex((credentialSelection: ICredentialSelection) => credentialSelection.id == itemInfo.item.id);
    credentialSelection[index].isSelected = !itemInfo.item.isSelected
    setCredentialSelection([...credentialSelection])
  }

  const onItemPress = async (credentialSelection: ICredentialSelection): Promise<void> => {
      props.navigation.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
        rawCredential: credentialSelection.rawCredential,
        credential: credentialSelection.credential,
        showActivity: false,
      })
  };

  const renderItem = (itemInfo: ListRenderItemInfo<ICredentialSelection>): JSX.Element => {
    return ( // todo remove wrapper
        <ItemContainer
            style={{backgroundColor: itemInfo.index % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark}}
            onPress={() => onItemPress(itemInfo.item)}
            onLongPress={() => onLongPress(itemInfo)}
        >
          <SSICredentialSelectViewItem
              id={itemInfo.item.id}
              title={itemInfo.item.credential.title}
              issuer={itemInfo.item.credential.issuer.alias}
              isSelected={itemInfo.item.isSelected}
              style={{backgroundColor: itemInfo.index % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark}}
              onLogoPress={() => onLongPress(itemInfo)} // TODO not working
          />
        </ItemContainer>
    )
  }

  return (
      <Container>
        <StatusBar />
        <SwipeListView
            data={credentialSelection}
            keyExtractor={(itemInfo: ICredentialSelection) => itemInfo.id} // TODO null assertion
            renderItem={renderItem}
            closeOnRowOpen
            closeOnRowBeginSwipe
            useFlatList
            initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
            removeClippedSubviews
        />
        <ButtonContainer>
          <SSIButtonsContainer
              primaryButton={{
                caption: translate('action_accept_label'),
                disabled: !credentialSelection.some((credentialSelection: ICredentialSelection) => credentialSelection.isSelected),
                onPress: async () => {
                  await onSelect(credentialSelection.filter((credentialSelection: ICredentialSelection) => credentialSelection.isSelected)
                    .map((credentialSelection: ICredentialSelection) => credentialSelection.id))
                  props.navigation.goBack()
                },
              }}
          />
        </ButtonContainer>
      </Container>
  )
}

export default SSICredentialsSelectScreen
