import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors, ImageAttributes} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import React, {useCallback} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import {CreditOverviewStackParamsList, RootState, ScreenRoutesEnum} from '../../types';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import {setViewPreference} from '../../store/actions/user.actions';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import {useFocusEffect} from '@react-navigation/native';
import {getVerifiableCredential} from '../../services/credentialService';

type Props = NativeStackScreenProps<CreditOverviewStackParamsList, 'Card'> & {
  verifiableCredentials: Array<CredentialSummary>;
  setViewPreference: (viewKey: ConfigurableViewKey, preference: ViewPreference) => void;
};

const getCredentialCardLogo = (credential: CredentialSummary): ImageAttributes | undefined => {
  if (credential.branding?.logo?.uri || credential.branding?.logo?.dataUri) {
    return credential.branding.logo;
  }

  const uri: string | undefined = getIssuerLogo(credential, credential.branding);
  if (uri) {
    return {uri};
  }
};

const CredentialViewCard = ({credential, onPress}: {credential: CredentialSummary; onPress: () => Promise<void>}) => {
  const issuer: string = credential.issuer.alias;
  const credentialCardLogo: ImageAttributes | undefined = getCredentialCardLogo(credential);

  return (
    <TouchableOpacity onPress={onPress}>
      <SSICredentialCardView
        header={{
          credentialTitle: credential.branding?.alias,
          credentialSubtitle: credential.branding?.description,
          logo: credentialCardLogo,
        }}
        body={{
          issuerName: issuer ?? credential.issuer.name,
        }}
        footer={{
          credentialStatus: getCredentialStatus(credential),
          expirationDate: credential.expirationDate,
        }}
        display={{
          backgroundColor: credential.branding?.background?.color,
          backgroundImage: credential.branding?.background?.image,
          textColor: credential.branding?.text?.color,
        }}
      />
    </TouchableOpacity>
  );
};

const CredentialsOverviewCardList = ({setViewPreference, verifiableCredentials, navigation}: Props) => {
  useFocusEffect(
    useCallback(() => {
      setViewPreference(ConfigurableViewKey.CREDENTIAL_OVERVIEW, ViewPreference.CARD);
    }, []),
  );

  const onItemPress = async (credential: CredentialSummary): Promise<void> => {
    const uniqueDigitalCredential = await getVerifiableCredential({credentialRole: credential.credentialRole, hash: credential.hash});
    navigation.getParent()?.navigate(ScreenRoutesEnum.CREDENTIAL_DETAILS, {
      rawCredential: uniqueDigitalCredential.originalVerifiableCredential, // TODO remove rawCredential
      uniqueDigitalCredential,
      credential,
      showActivity: false,
    });
  };

  return (
    <View
      style={{
        backgroundColor: backgroundColors.primaryDark,
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderTopColor: '#404D7A',
        borderTopWidth: verifiableCredentials.length > 0 ? 1 : 0,
      }}>
      {verifiableCredentials.map((credential, index) => (
        <CredentialViewCard key={index} credential={credential} onPress={() => onItemPress(credential)} />
      ))}
    </View>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    verifiableCredentials: state.credential.verifiableCredentials,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setViewPreference: (viewKey: ConfigurableViewKey, preference: ViewPreference) => dispatch(setViewPreference(viewKey, preference)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsOverviewCardList);
