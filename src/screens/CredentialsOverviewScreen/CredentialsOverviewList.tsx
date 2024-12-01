import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors, borderColors, toLocalDateString} from '@sphereon/ui-components.core';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import React, { FC, ReactElement, useCallback, useState } from 'react';
import {ListRenderItemInfo, RefreshControl, View} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {connect} from 'react-redux';
import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSICredentialViewItem from '../../components/views/SSICredentialViewItem';
import SSISwipeRowViewItem from '../../components/views/SSISwipeRowViewItem';
import {translate} from '../../localization/Localization';
import {getVerifiableCredential} from '../../services/credentialService';
import {deleteVerifiableCredential, getVerifiableCredentials} from '../../store/actions/credential.actions';
import {setViewPreference} from '../../store/actions/user.actions';
import {SSIRippleContainerStyled as ItemContainer} from '../../styles/components';
import {CreditOverviewStackParamsList, IUser, IUserIdentifier, MainRoutesEnum, RootState, ScreenRoutesEnum} from '../../types';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';

type Props = NativeStackScreenProps<CreditOverviewStackParamsList, ViewPreference.LIST> & {
  verifiableCredentials: Array<CredentialSummary>;
  activeUser: IUser;
  getVerifiableCredentials: () => void;
  deleteVerifiableCredential: (credentialHash: string) => void;
  setViewPreference: (viewKey: ConfigurableViewKey, preference: ViewPreference) => void;
};

const CredentialsOverviewList: FC<Props> = (props: Props): ReactElement => {
  const {
    setViewPreference,
    navigation,
    verifiableCredentials,
    activeUser,
    getVerifiableCredentials,
    deleteVerifiableCredential,
  } = props
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setViewPreference(ConfigurableViewKey.CREDENTIAL_OVERVIEW, ViewPreference.LIST);
    }, []),
  );

  const onRefresh = (): void => {
    getVerifiableCredentials();
    setRefreshing(false);
  };

  const onDelete = async (credentialHash: string, credentialName: string): Promise<void> => {
    navigation.getParent()?.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('credential_delete_title'),
      details: translate('credential_delete_message', {credentialName}),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async () => {
          deleteVerifiableCredential(credentialHash);
          navigation.getParent()?.goBack();
        },
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async () => navigation.getParent()?.goBack(),
      },
    });
  };

  const onItemPress = async (credential: CredentialSummary): Promise<void> => {
      getVerifiableCredential({credentialRole: credential.credentialRole, hash: credential.hash}).then((uniqueDigitalCredential) =>
        navigation.getParent()?.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
          rawCredential: uniqueDigitalCredential.originalVerifiableCredential, // TODO remove rawCredential
          uniqueDigitalCredential,
          credential,
        })
      )
  };

  const renderItem = (itemInfo: ListRenderItemInfo<CredentialSummary>): JSX.Element => {
    const credentialItem = (
      <SSICredentialViewItem
        hash={itemInfo.item.hash}
        id={itemInfo.item.id}
        branding={itemInfo.item.branding}
        title={itemInfo.item.branding?.alias ?? itemInfo.item.title}
        issuer={itemInfo.item.issuer}
        issueDate={itemInfo.item.issueDate}
        expirationDate={itemInfo.item.expirationDate}
        credentialStatus={itemInfo.item.credentialStatus}
        properties={[]}
        credentialRole={itemInfo.item.credentialRole}
      />
    );

    const backgroundStyle = {
      backgroundColor: itemInfo.index % 2 === 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark,
    };
    const style = {
      ...backgroundStyle,
      ...(itemInfo.index === verifiableCredentials.length - 1 &&
        itemInfo.index % 2 !== 0 && {borderBottomWidth: 1, borderBottomColor: borderColors.dark}),
    };

    const accessibility = {
      accessibilityLabel: `${itemInfo.item.title}. Issued by: ${itemInfo.item.issuer.alias}, on: ${toLocalDateString(
        itemInfo.item.issueDate,
      )}. Expires on: ${toLocalDateString(itemInfo.item.expirationDate)}. Status: ${itemInfo.item.credentialStatus}`,
      accessibilityHint: 'Go to credential details',
    };

    return activeUser.identifiers.some(
      (identifier: IUserIdentifier) => itemInfo.item.issuer.name === identifier.did && itemInfo.item.title === 'SphereonWalletIdentityCredential',
    ) ? (
      <ItemContainer style={style} onPress={() => onItemPress(itemInfo.item)} accessible {...accessibility}>
        {credentialItem}
      </ItemContainer>
    ) : (
      <View
        accessible
        {...accessibility}
        accessibilityActions={[{name: 'delete', label: 'delete credential'}, {name: 'activate'}]}
        onAccessibilityAction={event => {
          {
            switch (event.nativeEvent.actionName) {
              case 'delete':
                void onDelete(itemInfo.item.hash, itemInfo.item.title);
                break;
              case 'activate':
                void onItemPress(itemInfo.item);
                break;
            }
          }
        }}>
        <View importantForAccessibility="no-hide-descendants">
          <SSISwipeRowViewItem
            style={style}
            hiddenStyle={backgroundStyle}
            viewItem={credentialItem}
            onPress={() => onItemPress(itemInfo.item)}
            onDelete={() => onDelete(itemInfo.item.hash, itemInfo.item.branding?.alias ?? itemInfo.item.title)}
          />
        </View>
      </View>
    );
  };

  return (
    <SwipeListView
      accessibilityRole="list"
      accessibilityLabel="Credentials"
      style={{backgroundColor: backgroundColors.primaryDark, borderTopColor: '#404D7A', borderTopWidth: verifiableCredentials.length > 0 ? 1 : 0}}
      data={verifiableCredentials}
      keyExtractor={(itemInfo: CredentialSummary) => itemInfo.hash}
      renderItem={renderItem}
      closeOnRowOpen
      closeOnRowBeginSwipe
      useFlatList
      initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
      removeClippedSubviews
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};

const mapDispatchToProps = (dispatch: any) => {
  // TODO ThunkDispatch<any, unknown, Action>
  return {
    getVerifiableCredentials: () => dispatch(getVerifiableCredentials()),
    deleteVerifiableCredential: (credentialHash: string) => dispatch(deleteVerifiableCredential(credentialHash)),
    setViewPreference: (viewKey: ConfigurableViewKey, preference: ViewPreference) => dispatch(setViewPreference(viewKey, preference)),
  };
};

const mapStateToProps = (state: RootState) => {
  return {
    verifiableCredentials: state.credential.verifiableCredentials,
    activeUser: state.user.activeUser!,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsOverviewList);
