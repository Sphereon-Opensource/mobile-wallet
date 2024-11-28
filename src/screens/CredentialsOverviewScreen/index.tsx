import {useFocusEffect} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {Image, View} from 'react-native';
import {connect} from 'react-redux';
import {createTopBarNavigator} from '../../components/navigators/TopBarNavigator';
import {useAccessibility} from '../../hooks/useAccessibility';
import {SSIBasicContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../styles/components';
import {CreditOverviewStackParamsList, IUser, NavigationBarRoutesEnum, RootState} from '../../types';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import CredentialsOverviewCardList from './CredentialsOverviewCardList';
import CredentialsOverviewList from './CredentialsOverviewList';
import {CredentialsOverviewImages} from './constants';
import {Chat} from '../../components/chat/Chat';
import RootNavigation from '../../navigation/rootNavigation';
import {useChat} from '../../providers/chat/chatProvider';

const CredentialViewTypeNav = createTopBarNavigator<CreditOverviewStackParamsList>();

const renderLabel = (label: 'card' | 'list') => () => {
  const source = CredentialsOverviewImages[label];
  return <Image source={source} />;
};

type Props = {activeUser: IUser};

const CredentialsOverviewScreen = ({activeUser}: Props) => {
  const viewPreference = activeUser.preferences.views[ConfigurableViewKey.CREDENTIAL_OVERVIEW];
  const {closeModal} = useChat();
  const tools = useMemo(
    () => [
      {
        tool: {
          name: 'navigateToQRScanner',
          description: 'navigate to QR Scanner Screen',
          parameters: {},
        },
        callback: () => {
          RootNavigation.navigate(NavigationBarRoutesEnum.QR);
          closeModal();
        },
      },
    ],
    [], // Only re-create if dependencies change (none in this case)
  );

  const {announce} = useAccessibility();
  useFocusEffect(() => announce({message: 'Credential overview screen'}));
  return (
    <Container style={{paddingTop: 24}}>
      <StatusBar />
      <CredentialViewTypeNav.Navigator
        initialRouteName={viewPreference}
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
            [ViewPreference.CARD]: {render: renderLabel('card'), accessibilityLabel: 'Card view'},
            [ViewPreference.LIST]: {render: renderLabel('list'), accessibilityLabel: 'List view'},
          },
          renderIndicator: <View style={{height: '100%', backgroundColor: 'white', opacity: 0.1, borderRadius: 4}} />,
        }}>
        <CredentialViewTypeNav.Screen name={ViewPreference.LIST} component={CredentialsOverviewList} options={{swipeEnabled: false}}/>
        <CredentialViewTypeNav.Screen name={ViewPreference.CARD} component={CredentialsOverviewCardList} />
      </CredentialViewTypeNav.Navigator>
      <Chat
        screenContext={JSON.stringify({
          screen: 'Credentials Overview Screen',
          assistantInstructions: 'focus on moving to the qr scanner screen. Only use the navigateToQRScanner when explicitly confirmed by the user',
        })}
        tools={tools}
      />
    </Container>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeUser: state.user.activeUser!,
  };
};

export default connect(mapStateToProps)(CredentialsOverviewScreen);
