import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import {SSIBasicContainerSecondaryStyled as SSIContainer, SSITextH3LightStyled} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

import {useFocusEffect} from '@react-navigation/native';
import {backgroundColors} from '@sphereon/ui-components.core';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {NewContactViewItem} from '../../components/views/NewContactViewItem';
import {useAccessibility} from '../../hooks/useAccessibility';
import {Divider} from '../../styles/components/screens/SSIContactDetailsScreen';
import {IdentitiesContainer} from './style';

const Container = styled(SSIContainer)`
  background-color: ${backgroundColors.primaryDark};
`;

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_IDENTITIES>;

const ContactIdentitiesScreen: FC<Props> = (props: Props): JSX.Element => {
  const {identities} = props.route.params;
  const {announce} = useAccessibility();
  useFocusEffect(() => announce({message: 'Related identities to contact', delay: 1000}));
  return (
    <Container style={{paddingTop: 24}}>
      <ScrollView style={{flex: 1}}>
        <SSITextH3LightStyled style={{paddingLeft: 24, marginTop: 10}} accessibilityRole="header">
          All related identities
        </SSITextH3LightStyled>
        <Divider />
        <IdentitiesContainer accessibilityRole="list" accessibilityLabel="Identities">
          {identities.map((item, idx) => (
            <NewContactViewItem
              containerProps={{
                accessible: true,
                accessibilityLabel: `${item.alias}, roles: ${item.roles.join(', ')}`,
              }}
              logoSize={45}
              background={idx % 2 === 0 ? 'light' : 'dark'}
              key={idx}
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
