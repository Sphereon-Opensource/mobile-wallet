import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {navigationRef} from '../../navigation/rootNavigation';
import {ContactInformationView} from '../../components/views/ContactInformationView';
import {NavigationButton} from './components/NavigationButton';
import {ContactDetailsNavigationSection, Container, Divider} from './style';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_DETAILS>;

enum ContactTabRoutesEnum {
  INFO = 'info',
  IDENTITIES = 'identities',
  ACTIVITY = 'activity',
}

const SSIContactDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const {contact} = props.route.params;

  return (
    <Container>
      <ContactInformationView contact={contact} />
      <ContactDetailsNavigationSection>
        <NavigationButton label="Identities" onPress={() => navigationRef.navigate('ContactIdentities', {identities: contact.identities})} />
        <Divider />
        <NavigationButton label="Contact Activities" onPress={() => navigationRef.navigate('ContactActivity', {contact})} />
      </ContactDetailsNavigationSection>
    </Container>
  );
};

export default SSIContactDetailsScreen;
