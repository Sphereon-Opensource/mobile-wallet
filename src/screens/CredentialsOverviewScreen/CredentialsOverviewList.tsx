import {NavigationProp} from '@react-navigation/native';
import {backgroundColors, borderColors, toLocalDateString} from '@sphereon/ui-components.core';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import React, {FC, ReactElement, useMemo, useRef, useState} from 'react';
import {FlatList, ListRenderItemInfo, RefreshControl, View} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {connect} from 'react-redux';
import {filterVisibleCredentials, toDisplayCredentialStatus} from '../../utils/credentialVisibility';
import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSICredentialViewItem from '../../components/views/SSICredentialViewItem';
import SSISwipeDeleteButton from '../../components/buttons/SSISwipeDeleteButton';
import {translate} from '../../localization/Localization';
import {getVerifiableCredential} from '../../services/credentialService';
import {deleteVerifiableCredential, getVerifiableCredentials} from '../../store/actions/credential.actions';
import {SSIRippleContainerStyled as ItemContainer} from '../../styles/components';
import {IUser, IUserIdentifier, MainRoutesEnum, RootState, ScreenRoutesEnum} from '../../types';

type Props = {
  navigation: NavigationProp<any>;
  verifiableCredentials: Array<CredentialSummary>;
  activeUser: IUser;
  getVerifiableCredentials: () => void;
  deleteVerifiableCredential: (credentialHash: string) => void;
};

const CredentialsOverviewList: FC<Props> = (props: Props): ReactElement => {
  const {navigation, verifiableCredentials, activeUser, getVerifiableCredentials, deleteVerifiableCredential} = props;
  const [refreshing, setRefreshing] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable | null>>(new Map());

  const showRevoked = activeUser?.preferences?.showRevokedCredentials ?? false;
  const showExpired = activeUser?.preferences?.showExpiredCredentials ?? false;

  const visibleCredentials = useMemo(
    () => filterVisibleCredentials(verifiableCredentials, {showRevoked, showExpired}),
    [verifiableCredentials, showRevoked, showExpired],
  );

  const onRefresh = (): void => {
    getVerifiableCredentials();
    setRefreshing(false);
  };

  const isWalletIdentityCredential = (credential: CredentialSummary): boolean =>
    activeUser?.identifiers?.some(
      (identifier: IUserIdentifier) => credential.issuer.name === identifier.did && credential.title === 'SphereonWalletIdentityCredential',
    ) ?? false;

  const closeAllSwipeables = (exceptHash?: string): void => {
    swipeableRefs.current.forEach((ref, hash) => {
      if (hash !== exceptHash) {
        ref?.close();
      }
    });
  };

  const onDelete = async (credentialHash: string, credentialName: string): Promise<void> => {
    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('credential_delete_title'),
      details: translate('credential_delete_message', {credentialName}),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async () => {
          deleteVerifiableCredential(credentialHash);
        },
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async () => {},
      },
    });
  };

  const onDeleteProtected = async (credential: CredentialSummary): Promise<void> => {
    if (isWalletIdentityCredential(credential)) {
      navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
        title: translate('credential_delete_title'),
        details: translate('credential_delete_wallet_identity_message'),
        primaryButton: {
          caption: translate('action_cancel_label'),
          onPress: async () => {},
        },
      });
    } else {
      await onDelete(credential.hash, credential.branding?.alias ?? credential.title);
    }
  };

  const onItemPress = async (credential: CredentialSummary): Promise<void> => {
    getVerifiableCredential({credentialRole: credential.credentialRole, hash: credential.hash}).then(uniqueDigitalCredential =>
      navigation.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
        rawCredential: uniqueDigitalCredential.originalVerifiableCredential, // TODO remove rawCredential
        uniqueDigitalCredential,
        credential,
      }),
    );
  };

  const renderItem = ({item, index}: ListRenderItemInfo<CredentialSummary>): JSX.Element => {
    const credentialItem = (
      <SSICredentialViewItem
        hash={item.hash}
        id={item.id}
        branding={item.branding}
        title={item.branding?.alias ?? item.title}
        issuer={item.issuer}
        issueDate={item.issueDate}
        expirationDate={item.expirationDate}
        credentialStatus={toDisplayCredentialStatus(item)}
        properties={[]}
        credentialRole={item.credentialRole}
      />
    );

    const backgroundStyle = {
      backgroundColor: index % 2 === 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark,
    };
    const style = {
      ...backgroundStyle,
      ...(index === visibleCredentials.length - 1 && index % 2 !== 0 && {borderBottomWidth: 1, borderBottomColor: borderColors.dark}),
    };

    const accessibility = {
      accessibilityLabel: `${item.branding?.alias ?? item.title}. Issued by: ${item.issuer.alias ?? item.issuer.name}, on: ${toLocalDateString(
        item.issueDate,
      )}. Expires on: ${toLocalDateString(item.expirationDate)}. Status: ${item.credentialStatus}`,
      accessibilityHint: 'Go to credential details',
    };

    return (
      <View
        accessible
        {...accessibility}
        accessibilityActions={[{name: 'delete', label: 'delete credential'}, {name: 'activate'}]}
        onAccessibilityAction={event => {
          switch (event.nativeEvent.actionName) {
            case 'delete':
              void onDeleteProtected(item);
              break;
            case 'activate':
              void onItemPress(item);
              break;
          }
        }}>
        <Swipeable
          ref={ref => {
            swipeableRefs.current.set(item.hash, ref);
          }}
          renderRightActions={() => (
            <SSISwipeDeleteButton
              onPress={() => {
                swipeableRefs.current.get(item.hash)?.close();
                onDeleteProtected(item);
              }}
            />
          )}
          onSwipeableWillOpen={() => closeAllSwipeables(item.hash)}>
          <ItemContainer style={style} onPress={() => onItemPress(item)}>
            <View importantForAccessibility="no-hide-descendants">{credentialItem}</View>
          </ItemContainer>
        </Swipeable>
      </View>
    );
  };

  return (
    <FlatList
      accessibilityRole="list"
      accessibilityLabel="Credentials"
      style={{backgroundColor: backgroundColors.primaryDark, borderTopColor: '#404D7A', borderTopWidth: visibleCredentials.length > 0 ? 1 : 0}}
      data={visibleCredentials}
      keyExtractor={(item: CredentialSummary) => item.hash}
      renderItem={renderItem}
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
  };
};

const mapStateToProps = (state: RootState) => {
  return {
    verifiableCredentials: state.credential.verifiableCredentials,
    activeUser: state.user.activeUser!,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsOverviewList);
