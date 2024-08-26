import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import React, {useState} from 'react';
import {Image, ImageBackground, Text, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import {CreditOverviewStackParamsList, RootState} from 'src/types';
import {translate} from '../../localization/Localization';
import {toLocalDateString} from '../../utils';
import {SSIStatusLabel} from '@sphereon/ui-components.ssi-react-native';
import {SSITextH4SemiBoldStyled, SSITextH4Styled, SSITextH5Styled, SSITextH6Styled} from '../../styles/components';

type Props = NativeStackScreenProps<CreditOverviewStackParamsList, 'Card'> & {
  verifiableCredentials: Array<CredentialSummary>;
};

const CredentialViewCard = ({credential}: {credential: CredentialSummary}) => {
  const {branding, expirationDate, credentialStatus} = credential;
  if (!branding) {
    return;
  }
  const CARD_ASPECT_RATIO = 327 / 186;
  const backgroundURI = branding.background?.image?.uri;
  const backgroundColor = branding.background?.color ? branding.background.color : 'white';
  const logoURI = branding.logo?.uri;
  const [logoAspectRatio, setLogoAspectRatio] = useState(1);

  if (logoURI) {
    Image.getSize(logoURI, (width, height) => height && setLogoAspectRatio(width / height));
  }
  return (
    <TouchableOpacity style={{borderRadius: 16, overflow: 'hidden', backgroundColor: backgroundColor}}>
      <ImageBackground
        source={{uri: backgroundURI}}
        style={{aspectRatio: CARD_ASPECT_RATIO, minHeight: 0, justifyContent: 'space-between'}}
        resizeMode="cover">
        {logoURI && <Image source={{uri: logoURI}} style={{aspectRatio: logoAspectRatio, width: 32, position: 'absolute', top: 12, left: 12}} />}
        <View style={{padding: 12, alignItems: 'flex-end'}}>
          <SSITextH4SemiBoldStyled>{credential.title}</SSITextH4SemiBoldStyled>
          <SSITextH5Styled>{branding.description}</SSITextH5Styled>
        </View>
        <View>
          <View style={{paddingHorizontal: 12, paddingBottom: 3}}>
            <SSITextH4Styled>{credential.issuer.name}</SSITextH4Styled>
          </View>
          <View style={{backgroundColor: backgroundColors.lightGrey, padding: 12}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <SSITextH5Styled>
                {expirationDate
                  ? `${translate('credentials_view_item_expires_on')} ${toLocalDateString(expirationDate)}`
                  : translate('credential_status_never_expires_date_label')}
              </SSITextH5Styled>

              <SSIStatusLabel status={credentialStatus} color={fontColors.dark} />
            </View>
          </View>
        </View>
        {/* <Logo />
            <InformationContainer>
              <InformationContentContainer>
                <View>
                  <TitleCaption>{verifiableCredential.issuer.name}</TitleCaption>
                  <DescriptionCaption>description</DescriptionCaption>
                </View>
                <DescriptionCaption>issuer</DescriptionCaption>
              </InformationContentContainer>
            </InformationContainer> */}
      </ImageBackground>
    </TouchableOpacity>
  );
};

const CredentialsOverviewCardList = ({verifiableCredentials}: Props) => {
  return (
    <View style={{backgroundColor: backgroundColors.primaryDark, flex: 1, paddingHorizontal: 24}}>
      {verifiableCredentials.map(credential => (
        <CredentialViewCard credential={credential} />
      ))}
    </View>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    verifiableCredentials: state.credential.verifiableCredentials,
  };
};

export default connect(mapStateToProps)(CredentialsOverviewCardList);
