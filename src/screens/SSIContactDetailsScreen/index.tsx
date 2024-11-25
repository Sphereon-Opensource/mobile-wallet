import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CredentialRole} from '@sphereon/ssi-sdk.data-store';
import {IssuerStatus} from '@sphereon/ui-components.core';
import React from 'react';
import {NavigationButton} from '../../components/NavigationButton';
import {ContactInformationView} from '../../components/views/ContactInformationView';
import {useAccessibility} from '../../hooks/useAccessibility';
import {ContactDetailsNavigationSection, Container, Divider} from '../../styles/components/screens/SSIContactDetailsScreen';
import {MainRoutesEnum, NavigationBarRoutesEnum, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_DETAILS>;

const SSIContactDetailsScreen = ({route, navigation}: Props) => {
  const {contact} = route.params;
  const {announce} = useAccessibility();
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
  useFocusEffect(() => announce({message: `Contact details for ${contact.contact.displayName}`, delay: 1000}));
  return (
    <Container style={{paddingTop: 24}}>
      <ContactInformationView
        properties={contactDetails}
        name={contact.contact.displayName}
        roles={contact.roles}
        logo={contact.branding?.logo}
        style={{marginTop: 10}}
        status={IssuerStatus.VERIFIED}
      />
      <ContactDetailsNavigationSection>
        <NavigationButton label="Identities" onPress={() => navigation.push(ScreenRoutesEnum.CONTACT_IDENTITIES, {identities: contact.identities})} />
        <Divider />
        <NavigationButton
          label="Contact Activities"
          onPress={() => {
            if (contact.roles.includes(CredentialRole.HOLDER)) {
              navigation.getParent()?.navigate(MainRoutesEnum.HOME, {
                screen: NavigationBarRoutesEnum.ACTIVITIES,
              });
            } else {
              navigation.push(ScreenRoutesEnum.CONTACT_ACTIVITY, {contact});
            }
          }}
        />
      </ContactDetailsNavigationSection>
    </Container>
  );
};

export default SSIContactDetailsScreen;
