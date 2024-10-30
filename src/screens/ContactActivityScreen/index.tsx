import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useState} from 'react';
import {SSILogo as Logo, SSITextH5LightStyled} from '@sphereon/ui-components.ssi-react-native';

import {SSIBasicContainerSecondaryStyled as SSIContainer, SSITextH3LightStyled, SSITextH4LightStyled, TextInputStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

import {ScrollView, TextInput} from 'react-native';
import styled from 'styled-components/native';
import {backgroundColors} from '@sphereon/ui-components.core';
import {ContactDetailsHeader} from '../SSIContactDetailsScreen';
import SearchIcon from 'src/components/assets/icons/SearchIcon';

// const LogoContainer = styled(SSILogoContainer)`
//   width: 85px;
// `;

const Container = styled(SSIContainer)`
  background-color: ${backgroundColors.primaryDark};
`;

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_ACTIVITY>;

enum ContactTabRoutesEnum {
  INFO = 'info',
  IDENTITIES = 'identities',
  ACTIVITY = 'activity',
}

const ActivitySearchContainer = styled.View`
  margin-top: 10px;
  margin-bottom: 20px;
  border: 1px solid #404d7a;
  border-radius: 5px;
  width: 80%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 0px 0px 10px;
  align-self: center;
`;

const ActivitySearchInput = styled.TextInput`
  flex: 1;
  padding: 10px 20px;
  color: white;
`;

const IssuerBrandingContainer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0px;
`;

const ContactActivityScreen: FC<Props> = (props: Props): JSX.Element => {
  const {contact} = props.route.params;

  const [value, setValue] = useState('');

  return (
    <Container>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          flex: 1,
          alignItems: 'stretch',
          width: '100%',
        }}>
        <IssuerBrandingContainer>
          <Logo logo={contact.branding?.logo} size={30} />
        </IssuerBrandingContainer>
        <ActivitySearchContainer>
          <SearchIcon color="white" size={30} />
          <ActivitySearchInput placeholderTextColor="#FBFBFBCC" placeholder="Search for card or status" value={value} onChangeText={setValue} />
        </ActivitySearchContainer>
        <SSITextH3LightStyled style={{paddingLeft: 30, marginTop: 10}}>Activities</SSITextH3LightStyled>
        {/* <IdentitiesContainer></IdentitiesContainer> */}
      </ScrollView>
      {/* <SSITabView routes={routes} /> */}
    </Container>
  );
};

export default ContactActivityScreen;
