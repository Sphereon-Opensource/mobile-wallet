// console.log("📦 typeorm resolves to:", require.resolve("typeorm"));
import PolyfillCrypto from 'react-native-webview-crypto';
import 'cross-fetch/polyfill';

import {NavigationContainer} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {LogBox, Platform, StatusBar} from 'react-native';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {bindActionCreators} from 'redux';
import {DB_CONNECTION_NAME} from './src/@config/database';
import {agentContext, linkHandlers} from './src/agent';
import './src/agent/index';
import {AccessibilityProvider} from './src/contexts/AccessibiltyContext';
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
// Import useSafeAreaInsets
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {initialWindowMetrics, SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {toastConfig} from './src/@config/toasts';

LogBox.ignoreLogs([
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
  'Unable to activate keep awake',
  'new NativeEventEmitter',
]);

// ---------------------------------------------------------
// 1. DEFINE THE COMPONENT LOCALLY TO GUARANTEE USAGE
// ---------------------------------------------------------
const SafeToast = () => {
  const insets = useSafeAreaInsets();

  // Force a minimum of 60px offset on Android to clear the nav bar
  // insets.bottom is often 0 on the first frame, so we default to 48 (standard navbar height)
  const androidBottom = Math.max(insets.bottom, 48);
  const offset = Platform.OS === 'android' ? androidBottom + 20 : insets.bottom + 10;

  return (
    <Toast
      config={toastConfig}
      position="bottom"
      bottomOffset={offset}
    />
  );
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [navigationIsReady, setNavigationIsReady] = useState(false);

  useEffect(() => {
    async function prepare(): Promise<void> {
      try {
        if (typeof global.crypto === 'undefined') {
          // @ts-ignore
          if (typeof global.window !== 'undefined' && global.window.crypto) {
            global.crypto = global.window.crypto;
          }
        }
        await addLinkListeners(linkHandlers, agentContext);

        await IntentHandler.getInstance().enable();
        await LockingHandler.getInstance().enableLocking();
        await getDbConnection(DB_CONNECTION_NAME);

        StatusBar.setBarStyle('light-content', true);
        if (Platform.OS === PlatformsEnum.ANDROID) {
          StatusBar.setBackgroundColor('transparent');
          StatusBar.setTranslucent(true);
        }

        Localization.setI18nConfig();
        await _loadFontsAsync();

        const actions = bindActionCreators({getUsers}, store.dispatch);
        actions.getUsers();
      } catch (e) {
        console.warn(e);
      } finally {
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
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, navigationIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <PolyfillCrypto />
      <SafeAreaProvider initialMetrics={initialWindowMetrics} onLayout={onLayoutRootView}>
        <KeyboardProvider>
        <NavigationContainer onReady={() => setNavigationIsReady(true)} ref={navigationRef}>
          <OnTouchProvider>
            <GestureHandlerRootView style={{flex: 1}}>
              <AccessibilityProvider>
                <AppNavigator navigationIsReady={navigationIsReady} />

                {/* 2. USE THE LOCAL COMPONENT HERE */}
                <SafeToast />

              </AccessibilityProvider>
            </GestureHandlerRootView>
          </OnTouchProvider>
        </NavigationContainer>
        </KeyboardProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
