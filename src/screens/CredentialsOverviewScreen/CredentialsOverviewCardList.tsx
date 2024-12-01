import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import React, { FC, ReactElement, useCallback, useState } from 'react'
import {connect} from 'react-redux';
import {getVerifiableCredential} from '../../services/credentialService';
import {setViewPreference} from '../../store/actions/user.actions';
import {
  CreditOverviewStackParamsList,
  MainRoutesEnum,
  RootState,
  ScreenRoutesEnum
} from '../../types';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import CredentialCardStackView from '../../components/views/CredentialCardStackView'
import {SSIBasicContainerStyled as Container} from '../../styles/components';
import {translate} from '../../localization/Localization';
import {deleteVerifiableCredential, getVerifiableCredentials} from '../../store/actions/credential.actions';
import { RefreshControl } from 'react-native'

type Props = NativeStackScreenProps<CreditOverviewStackParamsList, ViewPreference.CARD> & {
  verifiableCredentials: Array<CredentialSummary>;
  getVerifiableCredentials: () => void;
  deleteVerifiableCredential: (credentialHash: string) => void;
  setViewPreference: (viewKey: ConfigurableViewKey, preference: ViewPreference) => void;
};

const CredentialsOverviewCardList: FC<Props> = (props: Props): ReactElement => {
  const {
    setViewPreference,
    verifiableCredentials,
    deleteVerifiableCredential,
    getVerifiableCredentials,
    navigation
  } = props
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback((): void => {
      setViewPreference(ConfigurableViewKey.CREDENTIAL_OVERVIEW, ViewPreference.CARD);
    }, []),
  );

  const onRefresh = (): void => {
    getVerifiableCredentials();
    setRefreshing(false);
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

  return (
    <Container>
      <CredentialCardStackView
        credentials={verifiableCredentials}
        onPress={onItemPress}
        onSwipe={async (credential) =>  onDelete(credential.hash, credential.branding?.alias ?? credential.title)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </Container>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    verifiableCredentials: state.credential.verifiableCredentials,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    getVerifiableCredentials: () => dispatch(getVerifiableCredentials()),
    deleteVerifiableCredential: (credentialHash: string) => dispatch(deleteVerifiableCredential(credentialHash)),
    setViewPreference: (viewKey: ConfigurableViewKey, preference: ViewPreference) => dispatch(setViewPreference(viewKey, preference)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsOverviewCardList);
