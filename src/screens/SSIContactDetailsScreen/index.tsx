import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useMemo} from 'react';

import SSIContactViewItem from '../../components/views/SSIContactViewItem';
import SSIIdentitiesView from '../../components/views/SSIIdentitiesView';
import {translate} from '../../localization/Localization';
import {SSIBasicContainerSecondaryStyled as SSIContainer, SSITextH3LightStyled, SSITextH4LightStyled} from '../../styles/components';
import {ITabViewRoute, ScreenRoutesEnum, StackParamList} from '../../types';

import {
  SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSITextH3LightStyled as ContactNameCaption,
  SSITextH4LightStyled as ContactRolesCaption,
  SSIContactViewItemContactUriCaptionStyled as ContactUriCaption,
  SSIContactViewItemContainerStyled as ContactDetailsHeaderContainer,
  SSIContactViewItemLogoContainerStyled as LogoContainer,
  SSIContactViewItemNewStatusContainerStyled as StatusContainer,
} from '../../styles/components';
import {CredentialRole, IImageAttributes, Party} from '@sphereon/ssi-sdk.data-store';
import {SSILogo as Logo, SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import SSICheckmarkIcon from '../../components/assets/icons/SSICheckmarkIcon';
import {navigationRef} from 'src/navigation/rootNavigation';
import SSIBackIcon from 'src/components/assets/icons/SSIBackIcon';

// const LogoContainer = styled(SSILogoContainer)`
//   width: 85px;
// `;

const Container = styled(SSIContainer)`
  background-color: ${backgroundColors.primaryDark};
`;

const VerifiedLabelContainer = styled.View`
  padding: 0px 10px 0px 0px;
  border: 1px solid green;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 4px;
  align-self: flex-start;
  border-radius: 10px;
`;

const VerifiedLabelIconContainer = styled.View`
  background-color: #00c249;
  aspect-ratio: 1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VerifiedLabelText = styled.Text`
  color: #00c249;
  font-size: 10px;
  align-self: center;
`;

const VerifiedLabel = () => {
  return (
    <VerifiedLabelContainer>
      <VerifiedLabelIconContainer>
        <SSICheckmarkIcon color="white" width={10} height={10} />
      </VerifiedLabelIconContainer>
      <VerifiedLabelText>Verified</VerifiedLabelText>
    </VerifiedLabelContainer>
  );
};

type ContactDetailsHeaderProps = {
  // contact: Party;
  name: string;
  uri?: string;
  logo?: IImageAttributes;
  roles: Array<CredentialRole>;
  verified?: boolean;
  background?: 'light' | 'dark';
};
export const ContactDetailsHeader = (props: ContactDetailsHeaderProps) => {
  const {name, uri, roles, logo, verified = true, background = 'dark'} = props;
  const backgroundColor = useMemo(() => {
    return background === 'light' ? '#2C334B' : backgroundColors.primaryDark;
  }, [background]);
  return (
    <ContactDetailsHeaderContainer style={{backgroundColor}}>
      <StatusContainer />
      <LogoContainer>
        <Logo logo={logo} size={60} />
      </LogoContainer>
      <View style={{flex: 1}}>
        <ContactDetailsContainer>
          <ContactNameCaption>{name}</ContactNameCaption>
          <ContactRolesCaption>{roles.join(', ')}</ContactRolesCaption>
        </ContactDetailsContainer>
        {verified && <VerifiedLabel />}
        {/* <ContactUriCaption>{uri}</ContactUriCaption> */}
      </View>
    </ContactDetailsHeaderContainer>
  );
};

const DetailsSection = styled.View`
  display: flex;
  align-items: stretch;
  padding: 20px 50px;

  gap: 15px;

  background-color: ${backgroundColors.secondaryDark};
`;

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_DETAILS>;

enum ContactTabRoutesEnum {
  INFO = 'info',
  IDENTITIES = 'identities',
  ACTIVITY = 'activity',
}

const SSIContactDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const {contact} = props.route.params;

  const routes: Array<ITabViewRoute> = [
    // {
    //   key: ContactTabRoutesEnum.INFO,
    //   title: translate('contact_details_info_tab_header_label'),
    //   // TODO WAL-584 implement content
    //   content: () => <SSIActivityView />,
    // },
    {
      key: ContactTabRoutesEnum.IDENTITIES,
      title: translate('contact_details_identities_tab_header_label'),
      content: () => <SSIIdentitiesView identities={contact.identities} />,
    },
    // {
    //   key: ContactTabRoutesEnum.ACTIVITY,
    //   title: translate('contact_details_activity_tab_header_label'),
    //   // TODO WAL-358 implement content
    //   content: () => <SSIActivityView />
    // }
  ];

  console.log('pa', JSON.stringify(contact, null, 2));

  const address = useMemo(() => {
    const first = contact.physicalAddresses.at(0);
    if (!first) return '';

    let address = '';
    if (first.cityName) address += first.cityName;
    if (first.countryCode) address += ', ' + first.countryCode;

    return address;
  }, [contact]);

  return (
    <Container>
      <ScrollView style={{flex: 1}}>
        <View style={{marginTop: 20, paddingHorizontal: 10, display: 'flex', alignItems: 'stretch', marginBottom: 20}}>
          <ContactDetailsHeader name={contact.contact.displayName} uri={contact.uri} roles={contact.roles} logo={contact.branding?.logo} />
        </View>
        <SSITextH3LightStyled style={{paddingLeft: 40}}>Details</SSITextH3LightStyled>
        <DetailsSection>
          <DetailsItem value={contact.contact.displayName} label="Name" />
          <DetailsItem value={address} label="Address" />
          <DetailsItem value={contact.uri ?? ''} label="Email" />
          <DetailsItem value={contact.branding?.description ?? ''} label="Name" />
          {/* <DetailsItem value={contact.branding?.} label="Name" /> */}
        </DetailsSection>

        <View style={{marginTop: 20, paddingHorizontal: 20, display: 'flex', alignItems: 'stretch', gap: 15}}>
          <NavigationButton label="Identities" onPress={() => navigationRef.navigate('ContactIdentities', {identities: contact.identities})} />
          <View style={{height: 1, backgroundColor: '#404D7A', width: '100%'}}></View>
          <NavigationButton label="Contact Activities" onPress={() => navigationRef.navigate('ContactActivity', {contact})} />
        </View>
      </ScrollView>
      {/* <SSITabView routes={routes} /> */}
    </Container>
  );
};

const NavigationButtonContainer = styled.Pressable`
  width: 100%;
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type NavigationButtonProps = {
  onPress: () => void;
  label: string;
};

export const NavigationButton = (props: NavigationButtonProps) => {
  const {onPress, label} = props;
  return (
    <NavigationButtonContainer onPress={onPress} style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
      <SSITextH4LightStyled style={{flex: 1}}>{label}</SSITextH4LightStyled>
      <View>
        <SSIBackIcon
          style={{
            transform: [
              {
                rotate: '180deg',
              },
            ],
          }}
          color="white"
        />
      </View>
    </NavigationButtonContainer>
  );
};

type DetailsItemProps = {
  label: string;
  value: string;
};

const Column = styled.View`
  display: flex;
  align-items: stretch;
  gap: 5px;
`;

const DetailsLabel = styled.Text`
  color: #fbfbfbcc;
  font-size: 11px;
  font-weight: 400;
`;

const DetailsValue = styled(DetailsLabel)`
  color: white;
  font-size: 14px;
`;

const DetailsItem = (props: DetailsItemProps) => {
  const {label, value} = props;
  return (
    <Column>
      <DetailsLabel>{label}</DetailsLabel>
      <DetailsValue>{value}</DetailsValue>
    </Column>
  );
};

export default SSIContactDetailsScreen;
