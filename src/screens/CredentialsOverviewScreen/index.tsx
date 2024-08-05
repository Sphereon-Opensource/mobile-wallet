import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {VerifiableCredential} from '@veramo/core';
import React, {PureComponent} from 'react';
import {ListRenderItemInfo, RefreshControl} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {connect} from 'react-redux';

import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSICredentialViewItem from '../../components/views/SSICredentialViewItem';
import SSISwipeRowViewItem from '../../components/views/SSISwipeRowViewItem';
import {translate} from '../../localization/Localization';
import {getVerifiableCredential} from '../../services/credentialService';
import {deleteVerifiableCredential, getVerifiableCredentials} from '../../store/actions/credential.actions';
import {
  SSIBasicContainerStyled as Container,
  SSIRippleContainerStyled as ItemContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {IUser, IUserIdentifier, MainRoutesEnum, RootState, ScreenRoutesEnum, StackParamList, ToastTypeEnum} from '../../types';
import {getOriginalVerifiableCredential, showToast} from '../../utils';
import {backgroundColors, borderColors} from '@sphereon/ui-components.core';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {Loggers} from '@sphereon/ssi-types';

export const logger = Loggers.DEFAULT.get('sphereon:screens');

interface IProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIALS_OVERVIEW> {
  getVerifiableCredentials: () => void;
  deleteVerifiableCredential: (credentialHash: string) => void;
  verifiableCredentials: Array<CredentialSummary>;
  activeUser: IUser;
}

interface IState {
  refreshing: boolean;
}

class CredentialsOverviewScreen extends PureComponent<IProps, IState> {
  state: IState = {
    refreshing: false,
  };

  onRefresh = async (): Promise<void> => {
    this.props.getVerifiableCredentials();
    this.setState({refreshing: false});
  };

  onDelete = async (credentialHash: string, credentialName: string): Promise<void> => {
    this.props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('credential_delete_title'),
      details: translate('credential_delete_message', {credentialName}),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async () => {
          this.props.deleteVerifiableCredential(credentialHash);
          this.props.navigation.goBack();
        },
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async () => this.props.navigation.goBack(),
      },
    });
  };

  onItemPress = async (credential: CredentialSummary): Promise<void> => {
    try {
      const vc: VerifiableCredential = await getVerifiableCredential({credentialRole: credential.credentialRole, hash: credential.hash});

      this.props.navigation.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
        rawCredential: getOriginalVerifiableCredential(vc),
        credential,
        showActivity: false,
      });
    } catch (e) {
      // onPress doesn't handle promise rejections, so log it for now.
      logger.error('onItemPress failed', e);
      showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('information_retrieve_failed_toast_message', {message: (e as Error).message})});
    }
  };

  renderItem = (itemInfo: ListRenderItemInfo<CredentialSummary>): JSX.Element => {
    const {activeUser, verifiableCredentials} = this.props;

    const credentialItem = (
      <SSICredentialViewItem
        hash={itemInfo.item.hash}
        id={itemInfo.item.id}
        branding={itemInfo.item.branding}
        title={itemInfo.item.title}
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

    return activeUser.identifiers.some(
      (identifier: IUserIdentifier) => itemInfo.item.issuer.name === identifier.did && itemInfo.item.title === 'SphereonWalletIdentityCredential',
    ) ? (
      <ItemContainer style={style} onPress={() => this.onItemPress(itemInfo.item)}>
        {credentialItem}
      </ItemContainer>
    ) : (
      <SSISwipeRowViewItem
        style={style}
        hiddenStyle={backgroundStyle}
        viewItem={credentialItem}
        onPress={() => this.onItemPress(itemInfo.item)}
        onDelete={() => this.onDelete(itemInfo.item.hash, itemInfo.item.title)}
      />
    );
  };

  render() {
    return (
      <Container>
        <StatusBar />
        <SwipeListView
          data={this.props.verifiableCredentials}
          keyExtractor={(itemInfo: CredentialSummary) => itemInfo.hash}
          renderItem={this.renderItem}
          closeOnRowOpen
          closeOnRowBeginSwipe
          useFlatList
          initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
        />
      </Container>
    );
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsOverviewScreen);
