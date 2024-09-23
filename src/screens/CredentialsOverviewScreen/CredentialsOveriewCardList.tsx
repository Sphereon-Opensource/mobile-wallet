import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CredentialRole} from '@sphereon/ssi-sdk.data-store';
import {backgroundColors, CredentialStatus, ImageAttributes} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import React, {useCallback} from 'react';
import {TouchableOpacity, useWindowDimensions, View} from 'react-native';
import {connect} from 'react-redux';
import {getVerifiableCredential} from '../../services/credentialService';
import {setViewPreference} from '../../store/actions/user.actions';
import {CreditOverviewStackParamsList, RootState, ScreenRoutesEnum} from '../../types';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import {CardContainer} from './CardContainer';

const mockCards: CredentialSummary[] = [
  {
    issuer: {
      name: 'Issuer 1',
      alias: 'Issuer 1',
    },
    credentialRole: CredentialRole.ISSUER,
    hash: 'hash 1',
    title: 'test 1',
    expirationDate: 111111111111,
    branding: {
      alias: 'test 1',
      description: 'test 1',
      logo: {
        uri: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
      },
      background: {
        color: 'pink',
      },
      text: {
        color: 'black',
      },
    },
    credentialStatus: CredentialStatus.VALID,
    issueDate: 111111111111,
    properties: [],
  },
  {
    issuer: {
      name: 'Issuer 2',
      alias: 'Issuer 2',
    },
    credentialRole: CredentialRole.ISSUER,
    hash: 'hash 2',
    title: 'test 2',
    expirationDate: 111111111111,
    branding: {
      alias: 'test 2',
      description: 'test 2',
      logo: {
        uri: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
      },
      background: {
        color: 'yellow',
      },
      text: {
        color: 'black',
      },
    },
    credentialStatus: CredentialStatus.VALID,
    issueDate: 111111111111,
    properties: [],
  },
  {
    issuer: {
      name: 'Issuer 3',
      alias: 'Issuer 3',
    },
    credentialRole: CredentialRole.ISSUER,
    hash: 'hash 3',
    title: 'test 3',
    expirationDate: 111111111111,
    branding: {
      alias: 'test 3',
      description: 'test 3',
      logo: {
        uri: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
      },
      background: {
        color: 'purple',
      },
      text: {
        color: 'black',
      },
    },
    credentialStatus: CredentialStatus.VALID,
    issueDate: 111111111111,
    properties: [],
  },
];

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
    <TouchableOpacity onPress={onPress} style={{width: '100%'}}>
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

  const carouselWidth = useWindowDimensions().width - 48;

  return (
    <View style={{backgroundColor: backgroundColors.primaryDark, flex: 1, paddingHorizontal: 24, alignItems: 'center'}}>
      {/* <Carousel
        style={{
          width: carouselWidth,
          height: 240,
          borderColor: "red",
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        width={carouselWidth - 50}
        height={200}
        pagingEnabled={true}
        snapEnabled={true}
        loop={true}
        autoPlay={false}
        autoPlayReverse={false}
        data={mockCards}
        mode='vertical-stack'
        modeConfig={{
          snapDirection: 'left',
          stackInterval: 16,
        }}
        // customConfig={() => ({type: "negative", viewCount: mockCards.length})}
        renderItem={({index, item}) => (
          <CredentialViewCard
            credential={item}
            key={index}
            onPress={() => onItemPress(item)}

          // entering={FadeInRight.delay(
          //   (viewCount - index) * 100,
          // ).duration(200)}
          />
        )}
      /> */}
      {/* {mockCards.map((credential, index) => (
        <CredentialViewCard key={index} credential={credential} onPress={() => onItemPress(credential)} />
      ))} */}
      <CardContainer />
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
