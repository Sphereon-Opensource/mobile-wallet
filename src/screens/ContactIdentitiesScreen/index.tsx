import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import {SSIBasicContainerSecondaryStyled as SSIContainer, SSITextH3LightStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import {backgroundColors, IssuerStatus} from '@sphereon/ui-components.core';
import {IdentitiesContainer} from './style';
import {Divider} from '../../styles/components/screens/SSIContactDetailsScreen';
import {NewContactViewItem} from '../../components/views/NewContactViewItem';

const Container = styled(SSIContainer)`
  background-color: ${backgroundColors.primaryDark};
`;

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_IDENTITIES>;

const ContactIdentitiesScreen: FC<Props> = (props: Props): JSX.Element => {
  const {identities} = props.route.params;

  return (
    <Container>
      <ScrollView style={{flex: 1}}>
        <SSITextH3LightStyled style={{paddingLeft: 24, marginTop: 10}}>All related identities</SSITextH3LightStyled>
        <Divider />
        <IdentitiesContainer>
          {identities.map((item, idx) => (
            <NewContactViewItem
              logoSize={45}
              background={idx % 2 === 0 ? 'light' : 'dark'}
              key={item.id}
              name={item.alias}
              roles={item.roles}
              style={{paddingVertical: 15, paddingLeft: 24, gap: 20}}
            />
          ))}
        </IdentitiesContainer>
      </ScrollView>
    </Container>
  );
};

export default ContactIdentitiesScreen;
