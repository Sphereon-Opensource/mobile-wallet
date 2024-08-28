import React from 'react';
import {Image, View} from 'react-native';
import {connect} from 'react-redux';
import {createTopBarNavigator} from '../../components/navigators/TopBarNavigator';
import {SSIBasicContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../styles/components';
import {CreditOverviewStackParamsList, IUser, RootState} from '../../types';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import {CredentialsOverviewImages} from './constants';
import CredentialsOveriewCardList from './CredentialsOveriewCardList';
import CredentialsOverviewList from './CredentialsOverviewList';

const CredentialViewTypeNav = createTopBarNavigator<CreditOverviewStackParamsList>();

const renderLabel = (label: 'card' | 'list') => () => {
  const source = CredentialsOverviewImages[label];
  return <Image source={source} />;
};

type Props = {activeUser: IUser};

const CredentialsOverviewScreen = ({activeUser}: Props) => {
  console.log('activeUser', activeUser);
  const viewPreference = activeUser.preferences.views[ConfigurableViewKey.CREDENTIAL_OVERVIEW];
  const initialRouteName = viewPreference === ViewPreference.CARD ? 'Card' : 'List';

  return (
    <Container>
      <StatusBar />
      <CredentialViewTypeNav.Navigator
        initialRouteName={initialRouteName}
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

const mapStateToProps = (state: RootState) => {
  return {
    activeUser: state.user.activeUser!,
  };
};

export default connect(mapStateToProps)(CredentialsOverviewScreen);
