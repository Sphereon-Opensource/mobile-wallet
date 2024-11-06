import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {navigationRef} from '../../navigation/rootNavigation';
import {ContactInformationView} from '../../components/views/ContactInformationView';
import {NavigationButton} from './components/NavigationButton';
import {ContactDetailsNavigationSection, Container, Divider} from '../../styles/components/screens/SSIContactDetailsScreen';
import {IssuerStatus} from '@sphereon/ui-components.core';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_DETAILS>;

const SSIContactDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const {contact} = props.route.params;
  const contactDetails = [
    {
      id: 'Name',
      label: 'Name',
      value: contact.contact.displayName,
    },
    {
      id: 'alias',
      label: 'Alias name',
      value: contact.branding?.alias,
    },
    {
      id: 'website',
      label: 'Website',
      value: contact.branding?.clientUri,
    },
    {
      id: 'description',
      label: 'Description',
      value: contact.branding?.description,
    },
    {
      id: 'tos_url',
      label: 'Terms of Service',
      value: contact.branding?.tosUri,
    },
    {
      id: 'privacy_url',
      label: 'Privacy Policy',
      value: contact.branding?.policyUri,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      value: contact.branding?.contacts,
    },
  ];

  return (
    <Container>
      <ContactInformationView
        properties={contactDetails}
        name={contact.contact.displayName}
        roles={contact.roles}
        logo={contact.branding?.logo}
        style={{marginTop: 10}}
        status={IssuerStatus.VERIFIED}
      />
      <ContactDetailsNavigationSection>
        <NavigationButton
          label="Identities"
          onPress={() => navigationRef.navigate(ScreenRoutesEnum.CONTACT_IDENTITIES, {identities: contact.identities})}
        />
        <Divider />
        <NavigationButton label="Contact Activities" onPress={() => navigationRef.navigate(ScreenRoutesEnum.CONTACT_ACTIVITY, {contact})} />
      </ContactDetailsNavigationSection>
    </Container>
  );
};

export default SSIContactDetailsScreen;
