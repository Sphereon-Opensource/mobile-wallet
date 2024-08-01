import {NavigationContainer} from '@react-navigation/native';
import {backgroundColors} from '@sphereon/ui-components.core';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {LogBox, Platform, StatusBar} from 'react-native';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {bindActionCreators} from 'redux';
import {DB_CONNECTION_NAME} from './src/@config/database';
import {agentContext, linkHandlers} from './src/agent';
import IntentHandler from './src/handlers/IntentHandler';
import {addLinkListeners} from './src/handlers/LinkHandlers';
import LockingHandler from './src/handlers/LockingHandler';
import _loadFontsAsync from './src/hooks/useFonts';
import Localization from './src/localization/Localization';
import AppNavigator from './src/navigation/navigation';
import {navigationRef} from './src/navigation/rootNavigation';
import OnTouchProvider from './src/providers/touch/OnTouchProvider';
import {getDbConnection} from './src/services/databaseService';
import store from './src/store';
import {getUsers} from './src/store/actions/user.actions';
import {PlatformsEnum} from './src/types';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {install as installCrypto} from 'react-native-quick-crypto';
import './src/agent/index';

LogBox.ignoreLogs([
  // Ignore require cycles for the app in dev mode. They do show up in Metro!
  'Require cycle:',
  /* /!*
    This warning comes from a dependency from what it looks like. As we already import AsyncStorage from @react-native-async-storage/async-storage
  *!/
  'AsyncStorage has been removed from react-native',*/
  /*
    TODO WAL-342
    Non-serializable values were found in the navigation state. Check:
    This can break usage such as persisting and restoring state. This might happen if you passed non-serializable values such as function, class instances etc. in params. If you need to use components with callbacks in your options, you
    can use 'navigation.setOptions' instead. See https://reactnavigation.org/docs/troubleshooting#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state for more details.
   */
  'Non-serializable values were found in the navigation state',
  /*
    TODO WAL-346
    We should implement a keep awake mechanism. https://docs.expo.dev/versions/latest/sdk/keep-awake/
   */
  'Unable to activate keep awake',
  /*
    TODO WAL-369
    https://stackoverflow.com/questions/69538962/new-nativeeventemitter-was-called-with-a-non-null-argument-without-the-requir/69649068#69649068
    The above seems very likely as the last update on react-native-share-menu was on May 12 2022
  */
  'new NativeEventEmitter',
]);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  // TODO use navigationIsReady to check if we can start the IntentHandler (as this needs a navigationRef) and remove the timeout placed in handleSharedFileData
  const [navigationIsReady, setNavigationIsReady] = useState(false);

  useEffect(() => {
    // TODO this function should be moved to an init place
    async function prepare(): Promise<void> {
      try {
        addLinkListeners(linkHandlers, agentContext);

        // Enable the intent handler early, so we can get deeplinks on start or before login
        await IntentHandler.getInstance().enable();
        await LockingHandler.getInstance().enableLocking();
        await getDbConnection(DB_CONNECTION_NAME);

        // TODO create better implementation for this
        StatusBar.setBarStyle('light-content', true);
        if (Platform.OS === PlatformsEnum.ANDROID) {
          StatusBar.setBackgroundColor(backgroundColors.primaryDark);
          StatusBar.setTranslucent(false);
        }

        Localization.setI18nConfig();
        // Preload fonts, make any API calls you need to do here
        await _loadFontsAsync();

        // Load the redux store
        const actions = bindActionCreators({getUsers}, store.dispatch);
        actions.getUsers();
        installCrypto();
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    void prepare();

    return (): void => {
      void IntentHandler.getInstance().disable();
      void LockingHandler.getInstance().disableLocking();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && navigationIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, navigationIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <NavigationContainer onReady={() => setNavigationIsReady(true)} ref={navigationRef}>
          <OnTouchProvider>
            <GestureHandlerRootView style={{flex: 1}}>
              <AppNavigator />
            </GestureHandlerRootView>
          </OnTouchProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
