import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {ListRenderItemInfo, ViewStyle} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';

import {backgroundColors, borderColors} from '@sphereon/ui-components.core';
import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import SSICredentialSelectViewItem from '../../components/views/SSICredentialSelectViewItem';
import {isCredentialExpired, isCredentialRevoked, toDisplayCredentialStatus} from '../../utils/credentialVisibility';
import {warnIfRevokedOrExpired} from '../../utils/presentationWarning';
import {useUserPreference} from '../../hooks/useUserPreference';
import {translate} from '../../localization/Localization';
import {
  SSICredentialsSelectScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSICredentialSelectScreenViewItemContainerStyled as ItemContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ICredentialSelection, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_SELECT>;

const SSICredentialsSelectScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {onSelect} = props.route.params;
  const [credentialSelection, setCredentialSelection] = React.useState(props.route.params.credentialSelection);
  const showRevoked = useUserPreference('showRevokedCredentials') ?? false;
  const showExpired = useUserPreference('showExpiredCredentials') ?? false;
  // Only offer credentials the user is allowed to see (revoked/expired hidden unless enabled in settings).
  const visibleSelection = React.useMemo(
    () =>
      credentialSelection.filter((s: ICredentialSelection) => {
        if (isCredentialRevoked(s.uniqueDigitalCredential) && !showRevoked) return false;
        if (isCredentialExpired(s.uniqueDigitalCredential) && !showExpired) return false;
        return true;
      }),
    [credentialSelection, showRevoked, showExpired],
  );

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
      rawCredential: selection.uniqueDigitalCredential.originalVerifiableCredential,
      uniqueDigitalCredential: selection.uniqueDigitalCredential,
      credential: selection.credential,
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
          credentialStatus={toDisplayCredentialStatus({
            verifiedState: itemInfo.item.uniqueDigitalCredential.digitalCredential?.verifiedState,
            credentialStatus: itemInfo.item.credential.credentialStatus,
          })}
          style={backgroundStyle}
          onPress={() => onLongPress(itemInfo)}
        />
      </ItemContainer>
    );
  };

  const onAccept = async (): Promise<void> => {
    const selected = credentialSelection.filter((s: ICredentialSelection) => s.isSelected);
    const proceed = (): Promise<void> => onSelect(selected.map((s: ICredentialSelection) => s.hash));
    if (
      !warnIfRevokedOrExpired(
        selected.map((s: ICredentialSelection) => s.uniqueDigitalCredential),
        proceed,
      )
    ) {
      await proceed();
    }
  };

  return (
    <Container>
      <StatusBar />
      <SwipeListView
        data={visibleSelection}
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
            disabled: !visibleSelection.some((s: ICredentialSelection) => s.isSelected),
            onPress: onAccept,
          }}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSICredentialsSelectScreen;
