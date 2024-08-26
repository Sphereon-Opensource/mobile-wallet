import React from 'react';
import {Image, View} from 'react-native';

import {createTopBarNavigator} from '../../components/navigators/TopBarNavigator';
import {SSIBasicContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../styles/components';
import {CreditOverviewStackParamsList} from '../../types';
import {CredentialsOverviewImages} from './constants';
import CredentialsOverviewList from './CredentialsOverviewList';
import {buttonColors, elementColors, fontColors} from '@sphereon/ui-components.core';
import CredentialsOveriewCardList from './CredentialsOveriewCardList';

const CredentialViewTypeNav = createTopBarNavigator<CreditOverviewStackParamsList>();

const renderLabel = (label: 'card' | 'list') => () => {
  const source = CredentialsOverviewImages[label];
  return <Image source={source} />;
};

const CredentialsOverviewScreen = () => {
  return (
    <Container>
      <StatusBar />
      <CredentialViewTypeNav.Navigator
        tapBarProps={{
          containerStyle: {
            width: 74,
            gap: 9,
            alignSelf: 'flex-end',
            height: 32,
            paddingVertical: 0,
            borderBottomWidth: 0,
            marginVertical: 16,
            marginHorizontal: 24,
          },
          indicatorStyle: {top: 0, zIndex: -1},
          labels: {
            Card: renderLabel('card'),
            List: renderLabel('list'),
          },
          renderIndicator: <View style={{height: '100%', backgroundColor: 'white', opacity: 0.1, borderRadius: 4}} />,
        }}>
        <CredentialViewTypeNav.Screen name="List" component={CredentialsOverviewList} options={{swipeEnabled: false}} />
        <CredentialViewTypeNav.Screen name="Card" component={CredentialsOveriewCardList} />
      </CredentialViewTypeNav.Navigator>
    </Container>
  );
};

export default CredentialsOverviewScreen;
