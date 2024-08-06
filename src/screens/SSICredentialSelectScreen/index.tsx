import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {ListRenderItemInfo, ViewStyle} from 'react-native';
import {useBackHandler} from '@react-native-community/hooks';
import {SwipeListView} from 'react-native-swipe-list-view';

import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICredentialSelectViewItem from '../../components/views/SSICredentialSelectViewItem';
import {translate} from '../../localization/Localization';
import {
  SSICredentialsSelectScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSICredentialSelectScreenViewItemContainerStyled as ItemContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ICredentialSelection, ScreenRoutesEnum, StackParamList} from '../../types';
import {backgroundColors, borderColors} from '@sphereon/ui-components.core';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_SELECT>;

const SSICredentialsSelectScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {onSelect} = props.route.params;
  const [credentialSelection, setCredentialSelection] = React.useState(props.route.params.credentialSelection);

  useBackHandler((): boolean => {
    // FIXME for some reason returning false does not execute default behaviour
    navigation.goBack();
    return true;
  });

  const setSelection = async (selection: ICredentialSelection, select?: boolean): Promise<void> => {
    const newSelection: Array<ICredentialSelection> = credentialSelection.map((credentialSelection: ICredentialSelection) => {
      const isSelected: boolean = select === undefined ? !selection.isSelected : select;
      credentialSelection.isSelected =
        credentialSelection.hash == selection.hash ? (credentialSelection.isSelected = isSelected) : (credentialSelection.isSelected = false);
      return credentialSelection;
    });
    setCredentialSelection(newSelection);
  };

  const onLongPress = async (itemInfo: ListRenderItemInfo<ICredentialSelection>): Promise<void> => {
    await setSelection(itemInfo.item);
  };

  const onSelectPress = async (selection: ICredentialSelection): Promise<void> => {
    await setSelection(selection, true);
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

  const renderItem = (itemInfo: ListRenderItemInfo<ICredentialSelection>): JSX.Element => {
    const backgroundStyle: ViewStyle = {
      backgroundColor: itemInfo.index % 2 === 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark,
    };
    const style: ViewStyle = {
      ...backgroundStyle,
      ...(itemInfo.index === credentialSelection.length - 1 &&
        itemInfo.index % 2 !== 0 && {borderBottomWidth: 1, borderBottomColor: borderColors.dark}),
    };
    return (
      <ItemContainer style={style} onPress={() => onItemPress(itemInfo.item)} onLongPress={() => onLongPress(itemInfo)}>
        <SSICredentialSelectViewItem
          title={itemInfo.item.credential.title}
          issuer={itemInfo.item.credential.issuer.alias}
          isSelected={itemInfo.item.isSelected}
          style={backgroundStyle}
          onPress={() => onLongPress(itemInfo)}
        />
      </ItemContainer>
    );
  };

  const onAccept = async (): Promise<void> => {
    await onSelect(
      credentialSelection
        .filter((credentialSelection: ICredentialSelection) => credentialSelection.isSelected)
        .map((credentialSelection: ICredentialSelection) => credentialSelection.hash),
    );
  };

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
            onPress: onAccept,
          }}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSICredentialsSelectScreen;
