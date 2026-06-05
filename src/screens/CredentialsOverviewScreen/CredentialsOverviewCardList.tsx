import {NavigationProp} from '@react-navigation/native';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import React, {FC, ReactElement, useMemo, useState} from 'react';
import {RefreshControl} from 'react-native';
import {connect} from 'react-redux';
import {filterVisibleCredentials} from '../../utils/credentialVisibility';
import {getVerifiableCredential} from '../../services/credentialService';
import CredentialCardStackView from '../../components/views/CredentialCardStackView';
import {SSIBasicContainerStyled as Container} from '../../styles/components';
import {translate} from '../../localization/Localization';
import {deleteVerifiableCredential, getVerifiableCredentials} from '../../store/actions/credential.actions';
import {IUser, IUserIdentifier, MainRoutesEnum, RootState, ScreenRoutesEnum} from '../../types';

type Props = {
  navigation: NavigationProp<any>;
  verifiableCredentials: Array<CredentialSummary>;
  activeUser: IUser | undefined;
  getVerifiableCredentials: () => void;
  deleteVerifiableCredential: (credentialHash: string) => void;
};

const CredentialsOverviewCardList: FC<Props> = (props: Props): ReactElement => {
  const {verifiableCredentials, activeUser, deleteVerifiableCredential, getVerifiableCredentials, navigation} = props;
  const [refreshing, setRefreshing] = useState(false);

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

  const onItemPress = async (credential: CredentialSummary): Promise<void> => {
    getVerifiableCredential({credentialRole: credential.credentialRole, hash: credential.hash}).then(uniqueDigitalCredential =>
      navigation.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
        rawCredential: uniqueDigitalCredential.originalVerifiableCredential, // TODO remove rawCredential
        uniqueDigitalCredential,
        credential,
      }),
    );
  };

  const onDelete = async (credentialHash: string, credentialName: string): Promise<void> => {
    navigation.getParent()?.navigate(MainRoutesEnum.POPUP_MODAL, {
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

  return (
    <Container>
      <CredentialCardStackView
        accessibilityRole="list"
        accessibilityLabel="Credentials"
        credentials={visibleCredentials}
        onPress={onItemPress}
        onSwipe={async credential => {
          const isWalletIdentity =
            activeUser?.identifiers?.some(
              (identifier: IUserIdentifier) => credential.issuer.name === identifier.did && credential.title === 'SphereonWalletIdentityCredential',
            ) ?? false;
          if (isWalletIdentity) {
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
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </Container>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    verifiableCredentials: state.credential.verifiableCredentials,
    activeUser: state.user.activeUser,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    getVerifiableCredentials: () => dispatch(getVerifiableCredentials()),
    deleteVerifiableCredential: (credentialHash: string) => dispatch(deleteVerifiableCredential(credentialHash)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsOverviewCardList);
