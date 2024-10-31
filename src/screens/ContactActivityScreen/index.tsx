import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useState} from 'react';
import {SSILogo as Logo} from '@sphereon/ui-components.ssi-react-native';

import {SSIBasicContainerSecondaryStyled as SSIContainer, SSITextH3LightStyled, SSITextH4LightStyled, TextInputStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

import {ScrollView} from 'react-native';
import SearchIcon from 'src/components/assets/icons/SearchIcon';
import {Container, Divider} from '../SSIContactDetailsScreen/style';
import {ActivitySearchContainer, ActivitySearchInput, IssuerBrandingContainer} from './style';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ACTIVITY>;

enum ContactTabRoutesEnum {
  INFO = 'info',
  IDENTITIES = 'identities',
  ACTIVITY = 'activity',
}

const ContactActivityScreen: FC<Props> = (props: Props): JSX.Element => {
  const {contact} = props.route.params;

  const [value, setValue] = useState('');

  return (
    <Container>
      <IssuerBrandingContainer>
        <Logo logo={contact.branding?.logo} size={30} />
      </IssuerBrandingContainer>
      {/* TODO: replace this search element with odi's search input component */}
      <ActivitySearchContainer>
        <SearchIcon color="white" size={30} />
        <ActivitySearchInput placeholderTextColor="#FBFBFBCC" placeholder="Search for card or status" value={value} onChangeText={setValue} />
      </ActivitySearchContainer>
      <SSITextH3LightStyled style={{paddingLeft: 30, marginTop: 10}}>Activities</SSITextH3LightStyled>
      <Divider />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          flex: 1,
          alignItems: 'stretch',
          width: '100%',
        }}>
        {/* TODO: add odi's activity list item here */}
      </ScrollView>
    </Container>
  );
};

export default ContactActivityScreen;
