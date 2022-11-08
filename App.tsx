import { NavigationContainer } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { LogBox, StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'

import 'react-native-gesture-handler'
import _loadFontsAsync from './src/hooks/useFonts'
import Localization from './src/localization/Localization'
import { RootStackNavigator } from './src/navigation/navigation'
import { navigationRef } from './src/navigation/rootNavigation'
import store from './src/store'
import { backgrounds } from './src/styles/colors'

LogBox.ignoreLogs([
  'Require cycle:', // Ignore require cycles for the app in dev mode. They do show up in Metro!
  'Non-serializable values were found in the navigation state' // https://reactnavigation.org/docs/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
])

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false)

  // TODO create better implementation for this
  StatusBar.setBarStyle('light-content', true)
  StatusBar.setBackgroundColor(backgrounds.primaryDark)
  StatusBar.setTranslucent(false)
  Localization.setI18nConfig()

  const loadFonts = async (): Promise<void> => {
    await _loadFontsAsync()
  }

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        // TODO: Enable splashscreen
        // await SplashScreen.preventAutoHideAsync()
        // Pre-load fonts, make any API calls you need to do here
        // await Font.loadAsync(Entypo.font);
        await loadFonts()
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (e) {
        console.warn(e)
      } finally {
        // Tell the application to render
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      // await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <NavigationContainer ref={navigationRef}>
          <RootStackNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  )
}
