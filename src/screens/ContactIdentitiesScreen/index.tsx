import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import {SSIBasicContainerSecondaryStyled as SSIContainer, SSITextH3LightStyled, SSITextH4LightStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

import {ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {backgroundColors} from '@sphereon/ui-components.core';
import {ContactDetailsHeader} from '../SSIContactDetailsScreen';

// const LogoContainer = styled(SSILogoContainer)`
//   width: 85px;
// `;

const Container = styled(SSIContainer)`
  background-color: ${backgroundColors.primaryDark};
`;

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_IDENTITIES>;

enum ContactTabRoutesEnum {
  INFO = 'info',
  IDENTITIES = 'identities',
  ACTIVITY = 'activity',
}

const IdentitiesContainer = styled.View`
  display: flex;
  align-items: stretch;
  padding: 10px 0px;
`;

const ContactIdentitiesScreen: FC<Props> = (props: Props): JSX.Element => {
  const {identities} = props.route.params;

  console.log('identities', JSON.stringify(identities, null, 2));

  return (
    <Container>
      <ScrollView style={{flex: 1}}>
        <SSITextH3LightStyled style={{paddingLeft: 30, marginTop: 10}}>Details</SSITextH3LightStyled>
        <IdentitiesContainer>
          {identities.map((item, idx) => (
            <ContactDetailsHeader background={idx % 2 === 0 ? 'light' : 'dark'} key={item.id} verified={false} name={item.alias} roles={item.roles} />
          ))}
        </IdentitiesContainer>
      </ScrollView>
      {/* <SSITabView routes={routes} /> */}
    </Container>
  );
};

export default ContactIdentitiesScreen;
