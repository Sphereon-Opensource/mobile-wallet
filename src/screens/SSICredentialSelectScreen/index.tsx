import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {ListRenderItemInfo} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';

import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICredentialSelectViewItem from '../../components/views/SSICredentialSelectViewItem';
import {translate} from '../../localization/Localization';
import {backgrounds} from '../../styles/colors';
import {
  SSICredentialsRequiredScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSICredentialSelectTypeScreenViewItemContainerStyled as ItemContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ICredentialSelection, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_SELECT>;

const SSICredentialsSelectScreen: FC<Props> = (props: Props): JSX.Element => {
  const {onSelect} = props.route.params;
  const [credentialSelection, setCredentialSelection] = React.useState(props.route.params.credentialSelection);

  const setSelection = async (selection: ICredentialSelection): Promise<void> => {
    const newSelection = credentialSelection.map((credentialSelection: ICredentialSelection) => {
      credentialSelection.isSelected =
        credentialSelection.hash == selection.hash
          ? (credentialSelection.isSelected = !selection.isSelected)
          : (credentialSelection.isSelected = false);
      return credentialSelection;
    });
    setCredentialSelection(newSelection);
  };

  const onLongPress = async (itemInfo: ListRenderItemInfo<ICredentialSelection>): Promise<void> => {
    await setSelection(itemInfo.item);
  };

  const onSelectPress = async (selection: ICredentialSelection): Promise<void> => {
    await setSelection(selection);
    props.navigation.goBack();
  };

  const onItemPress = async (selection: ICredentialSelection): Promise<void> => {
    props.navigation.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
      rawCredential: selection.rawCredential,
      credential: selection.credential,
      showActivity: false,
      primaryAction: {
        caption: translate('action_select_label'),
        onPress: () => onSelectPress(selection),
      },
    });
  };

  const renderItem = (itemInfo: ListRenderItemInfo<ICredentialSelection>): JSX.Element => (
    <ItemContainer
      style={{backgroundColor: itemInfo.index % 2 === 0 ? backgrounds.secondaryDark : backgrounds.primaryDark}}
      onPress={() => onItemPress(itemInfo.item)}
      onLongPress={() => onLongPress(itemInfo)}>
      <SSICredentialSelectViewItem
        hash={itemInfo.item.hash}
        id={itemInfo.item.id}
        title={itemInfo.item.credential.title}
        issuer={itemInfo.item.credential.issuer.alias}
        isSelected={itemInfo.item.isSelected}
        style={{backgroundColor: itemInfo.index % 2 === 0 ? backgrounds.secondaryDark : backgrounds.primaryDark}}
        onLogoPress={() => onLongPress(itemInfo)}
      />
    </ItemContainer>
  );

  return (
    <Container>
      <StatusBar />
      <SwipeListView
        data={credentialSelection}
        keyExtractor={(itemInfo: ICredentialSelection) => itemInfo.hash}
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
              await onSelect(
                credentialSelection
                  .filter((credentialSelection: ICredentialSelection) => credentialSelection.isSelected)
                  .map((credentialSelection: ICredentialSelection) => credentialSelection.hash),
              );
              props.navigation.goBack();
            },
          }}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSICredentialsSelectScreen;
