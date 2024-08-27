import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors, ImageAttributes} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import React, {useCallback} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import {CreditOverviewStackParamsList, RootState} from '../../types';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import {setViewPreference} from '../../store/actions/user.actions';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import {useFocusEffect} from '@react-navigation/native';

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

const CredentialViewCard = ({credential}: {credential: CredentialSummary}) => {
  const issuer: string = credential.issuer.alias;
  const credentialCardLogo: ImageAttributes | undefined = getCredentialCardLogo(credential);
  return (
    <TouchableOpacity>
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

const CredentialsOverviewCardList = ({setViewPreference, verifiableCredentials}: Props) => {
  useFocusEffect(
    useCallback(() => {
      setViewPreference(ConfigurableViewKey.CREDENTIAL_OVERVIEW, ViewPreference.CARD);
    }, []),
  );

  return (
    <View style={{backgroundColor: backgroundColors.primaryDark, flex: 1, paddingHorizontal: 24, alignItems: 'center'}}>
      {verifiableCredentials.map((credential, index) => (
        <CredentialViewCard key={index} credential={credential} />
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
