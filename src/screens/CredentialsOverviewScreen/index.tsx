import React from 'react';
import {View} from 'react-native';

import {createTopBarNavigator} from '../../components/navigators/TopBarNavigator';
import {
  SSIBasicContainerStyled as Container,
  SSITextH2LightStyled,
  SSITextH2SemiBoldLightStyled,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {CreditOverviewStackParamsList} from '../../types';
import CredentialsOverviewList from './CredentialsOverviewList';

const CredentialViewTypeNav = createTopBarNavigator<CreditOverviewStackParamsList>();

const renderLabel = (label: string) => (isFocused: boolean) => {
  const TextComponent = isFocused ? SSITextH2SemiBoldLightStyled : SSITextH2LightStyled;
  return <TextComponent>{label}</TextComponent>;
};

const CredentialsOverviewScreen = () => {
  return (
    <Container>
      <StatusBar />
      <CredentialViewTypeNav.Navigator
        tapBarProps={{
          labels: {
            List: renderLabel('List'),
            Card: renderLabel('Card'),
          },
        }}>
        <CredentialViewTypeNav.Screen name="List" component={CredentialsOverviewList} options={{swipeEnabled: false}} />
        <CredentialViewTypeNav.Screen name="Card" component={() => <View />} />
      </CredentialViewTypeNav.Navigator>
    </Container>
  );
};

export default CredentialsOverviewScreen;
