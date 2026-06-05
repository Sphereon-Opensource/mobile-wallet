import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {connect, useDispatch} from 'react-redux';
import CredentialStatusFilterChips from '../../components/views/CredentialStatusFilterChips';
import CredentialViewToggle from '../../components/views/CredentialViewToggle';
import {setViewPreference, updatePreferences} from '../../store/actions/user.actions';
import {useAccessibility} from '../../hooks/useAccessibility';
import {SSIBasicContainerStyled as Container, SSIStatusBarDarkModeStyled as StatusBar} from '../../styles/components';
import {IUser, NavigationBarRoutesEnum, RootState} from '../../types';
import {ConfigurableViewKey, ViewPreference} from '../../types/preferences';
import CredentialsOverviewCardList from './CredentialsOverviewCardList';
import CredentialsOverviewList from './CredentialsOverviewList';
import {Chat} from '../../components/chat/Chat';
import RootNavigation from '../../navigation/rootNavigation';
import {useChat} from '../../providers/chat/chatProvider';

type Props = {activeUser: IUser};

const CredentialsOverviewScreen = ({activeUser}: Props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {closeModal} = useChat();

  const storedView = activeUser.preferences.views[ConfigurableViewKey.CREDENTIAL_OVERVIEW];
  const [view, setView] = useState<ViewPreference>(storedView ?? ViewPreference.CARD);
  const showRevoked = activeUser.preferences?.showRevokedCredentials ?? false;
  const showExpired = activeUser.preferences?.showExpiredCredentials ?? false;

  const onChangeView = (next: ViewPreference): void => {
    setView(next);
    dispatch<any>(setViewPreference(ConfigurableViewKey.CREDENTIAL_OVERVIEW, next));
  };

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
    [],
  );

  const {announce} = useAccessibility();
  useFocusEffect(() => announce({message: 'Credential overview screen'}));

  return (
    <Container style={{paddingTop: 24}}>
      <StatusBar />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          marginBottom: 16,
          minHeight: 36,
        }}>
        <CredentialStatusFilterChips
          showRevoked={showRevoked}
          showExpired={showExpired}
          onToggleRevoked={() => dispatch<any>(updatePreferences({showRevokedCredentials: !showRevoked}))}
          onToggleExpired={() => dispatch<any>(updatePreferences({showExpiredCredentials: !showExpired}))}
        />
        <CredentialViewToggle value={view} onChange={onChangeView} />
      </View>
      <View style={{flex: 1}}>
        {view === ViewPreference.LIST ? (
          <CredentialsOverviewList {...({navigation} as any)} />
        ) : (
          <CredentialsOverviewCardList {...({navigation} as any)} />
        )}
      </View>
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
