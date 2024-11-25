import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {Image, View} from 'react-native';
import {connect} from 'react-redux';
import {createTopBarNavigator} from '../../components/navigators/TopBarNavigator';
import {useAccessibility} from '../../hooks/useAccessibility';
import {SSIBasicContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../styles/components';
import {CreditOverviewStackParamsList, IUser, RootState} from '../../types';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import CredentialsOverviewCardList from './CredentialsOverviewCardList';
import CredentialsOverviewList from './CredentialsOverviewList';
import {CredentialsOverviewImages} from './constants';

const CredentialViewTypeNav = createTopBarNavigator<CreditOverviewStackParamsList>();

const renderLabel = (label: 'card' | 'list') => (isFocused: boolean) => {
  const source = CredentialsOverviewImages[label];
  return <Image source={source} />;
};

type Props = {activeUser: IUser};

const CredentialsOverviewScreen = ({activeUser}: Props) => {
  const viewPreference = activeUser.preferences.views[ConfigurableViewKey.CREDENTIAL_OVERVIEW];
  const initialRouteName = viewPreference === ViewPreference.CARD ? 'Card' : 'List';
  const {announce} = useAccessibility();
  useFocusEffect(() => announce({message: 'Credential overview screen'}));
  return (
    <Container style={{paddingTop: 24}}>
      <StatusBar />
      <CredentialViewTypeNav.Navigator
        initialRouteName={initialRouteName}
        tapBarProps={{
          containerStyle: {
            width: 74,
            alignSelf: 'flex-end',
            height: 32,
            paddingVertical: 0,
            borderBottomWidth: 0,
            marginBottom: 16,
            marginHorizontal: 24,
          },
          indicatorStyle: {top: 0, zIndex: -1},
          labels: {
            Card: {render: renderLabel('card'), accessibilityLabel: 'Card view'},
            List: {render: renderLabel('list'), accessibilityLabel: 'List view'},
          },
          renderIndicator: <View style={{height: '100%', backgroundColor: 'white', opacity: 0.1, borderRadius: 4}} />,
        }}>
        <CredentialViewTypeNav.Screen name="List" component={CredentialsOverviewList} options={{swipeEnabled: false}} />
        <CredentialViewTypeNav.Screen name="Card" component={CredentialsOverviewCardList} />
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
