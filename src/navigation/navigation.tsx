import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NativeStackHeaderProps } from '@react-navigation/native-stack/lib/typescript/src/types'
import React from 'react'
import { Platform } from 'react-native'
import Toast from 'react-native-toast-message'

import { toastConfig, toastsAutoHide, toastsBottomOffset, toastsVisibilityTime } from '../@config/toasts'
import { NavigationBarRoutesEnum, PlatformsEnum, RootRoutesEnum, ScreenRoutesEnum, StackParamList } from '../@types'
import SSIHeaderBar from '../components/bars/SSIHeaderBar'
import SSINavigationBar from '../components/bars/SSINavigationBar'
import { translate } from '../localization/Localization'
import SSIAlertModal from '../modals/SSIAlertModal'
import SSIPopupModal from '../modals/SSIPopupModal'
import * as RootNavigation from '../navigation/rootNavigation'
import SSIConnectionDetailsScreen from '../screens/SSIConnectionDetailsScreen'
import SSIConnectionsOverviewScreen from '../screens/SSIConnectionsOverviewScreen'
import SSICredentialDetailsScreen from '../screens/SSICredentialDetailsScreen'
import SSICredentialRawJson from '../screens/SSICredentialRawJson'
import SSICredentialsOverviewScreen from '../screens/SSICredentialsOverviewScreen'
import SSIErrorScreen from '../screens/SSIErrorScreen'
import SSIPEXVerificationScreen from '../screens/SSIPEXVerificationScreen'
import SSIQRReader from '../screens/SSIQRReader'
import SSICredentialSelectTypeScreen from '../screens/SSISSICredentialSelectTypeScreen'
import SSIVerificationCodeScreen from '../screens/SSIVerificationCodeScreen'
import Veramo from '../screens/Veramo'

const format = require('string-format')

const Stack = createNativeStackNavigator<StackParamList>()
const Tab = createBottomTabNavigator()

export const RootStackNavigator = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={RootRoutesEnum.MAIN}
      screenOptions={{
        animation: 'none',
        headerShown: false
      }}
    >
      <Stack.Screen name={RootRoutesEnum.MAIN} component={TabStackNavigator} />
      <Stack.Screen
        name={RootRoutesEnum.ALERT_MODAL}
        children={() => (
          <>
            <SSIAlertModal />
            <Toast
              bottomOffset={toastsBottomOffset}
              autoHide={toastsAutoHide}
              visibilityTime={toastsVisibilityTime}
              config={toastConfig}
            />
          </>
        )}
        options={{
          presentation: 'transparentModal'
        }}
      />
      <Stack.Screen
        name={RootRoutesEnum.POPUP_MODAL}
        children={() => (
          <>
            <SSIPopupModal />
            <Toast
              bottomOffset={toastsBottomOffset}
              autoHide={toastsAutoHide}
              visibilityTime={toastsVisibilityTime}
              config={toastConfig}
            />
          </>
        )}
        options={{
          presentation: 'transparentModal'
        }}
      />
      <Stack.Screen name="Veramo" component={Veramo} />
    </Stack.Navigator>
  )
}

export const TabStackNavigator = (): JSX.Element => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // unmountOnBlur resets the stack back to initial state
        unmountOnBlur: true
      }}
      tabBar={(props: BottomTabBarProps) => <SSINavigationBar {...props} />}
      initialRouteName={NavigationBarRoutesEnum.HOME}
      backBehavior="none"
    >
      <Tab.Screen
        name={NavigationBarRoutesEnum.QR}
        children={() => (
          <>
            <QRStack />
            <Toast
              bottomOffset={toastsBottomOffset}
              autoHide={toastsAutoHide}
              visibilityTime={toastsVisibilityTime}
              config={toastConfig}
            />
          </>
        )}
      />
      <Tab.Screen
        name={NavigationBarRoutesEnum.NOTIFICATIONS}
        children={() => (
          <>
            <NotificationsStack />
            <Toast
              bottomOffset={toastsBottomOffset}
              autoHide={toastsAutoHide}
              visibilityTime={toastsVisibilityTime}
              config={toastConfig}
            />
          </>
        )}
      />
      <Tab.Screen
        name={NavigationBarRoutesEnum.HOME}
        children={() => (
          <>
            <HomeStack />
            <Toast
              bottomOffset={toastsBottomOffset}
              autoHide={toastsAutoHide}
              visibilityTime={toastsVisibilityTime}
              config={toastConfig}
            />
          </>
        )}
      />
      <Tab.Screen
        name={NavigationBarRoutesEnum.CONNECTIONS}
        children={() => (
          <>
            <ConnectionsStack />
            <Toast
              bottomOffset={toastsBottomOffset}
              autoHide={toastsAutoHide}
              visibilityTime={toastsVisibilityTime}
              config={toastConfig}
            />
          </>
        )}
      />
    </Tab.Navigator>
  )
}

const HomeStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.CREDENTIALS_OVERVIEW}
      screenOptions={{
        animation: 'none'
      }}
    >
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIALS_OVERVIEW}
        component={SSICredentialsOverviewScreen}
        options={{
          headerTitle: translate('credentials_overview_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              showBorder // TODO this more button can look at when an action is passed in for visibility
            />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_DETAILS}
        component={SSICredentialDetailsScreen}
        options={({ route }) => ({
          headerTitle: translate('credential_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              showBackButton={Platform.OS === PlatformsEnum.IOS}
              showMoreButton // TODO this more button can look at when an action is passed in for visibility
              moreButtonAction={async () =>
                RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                  rawCredential: route.params.rawCredential
                })
              }
            />
          )
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_RAW_JSON}
        component={SSICredentialRawJson}
        options={{
          headerTitle: translate('raw_credential_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props} showBackButton={Platform.OS === PlatformsEnum.IOS} />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={{
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} />
        }}
      />
    </Stack.Navigator>
  )
}

const ConnectionsStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.CONNECTIONS_OVERVIEW}
      screenOptions={{
        animation: 'none'
      }}
    >
      <Stack.Screen
        name={ScreenRoutesEnum.CONNECTIONS_OVERVIEW}
        component={SSIConnectionsOverviewScreen}
        options={{
          headerTitle: translate('connections_overview_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              showBackButton={Platform.OS === PlatformsEnum.IOS}
              showMoreButton // TODO this more button can look at when an action is passed in for visibility
              showBorder
            />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CONNECTION_DETAILS}
        component={SSIConnectionDetailsScreen}
        options={{
          headerTitle: translate('connection_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props} showBackButton={Platform.OS === PlatformsEnum.IOS} showMoreButton />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={{
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} />
        }}
      />
    </Stack.Navigator>
  )
}

const QRStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.QR_READER}
      screenOptions={{
        animation: 'none'
      }}
    >
      <Stack.Screen
        name={ScreenRoutesEnum.QR_READER}
        component={SSIQRReader}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.VERIFICATION_CODE}
        component={SSIVerificationCodeScreen}
        options={({ route }) => ({
          headerTitle: translate('verification_code_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={format(translate('verification_code_subtitle'), route.params.credentialName)}
            />
          )
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CONNECTION_DETAILS}
        component={SSIConnectionDetailsScreen}
        options={{
          headerTitle: translate('connection_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              showBackButton={Platform.OS === PlatformsEnum.IOS}
              showMoreButton // TODO this more button can look at when an action is passed in for visibility
            />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.PEX_VERIFICATION}
        component={SSIPEXVerificationScreen}
        options={{
          headerTitle: translate('pex_verification_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props} showBackButton={Platform.OS === PlatformsEnum.IOS} />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_DETAILS}
        component={SSICredentialDetailsScreen}
        options={({ route }) => ({
          headerTitle: translate('credential_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              showBackButton={Platform.OS === PlatformsEnum.IOS}
              showMoreButton // TODO this more button can look at when an action is passed in for visibility
              headerSubTitle={translate('credential_details_subtitle')}
              moreButtonAction={async () =>
                RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                  rawCredential: route.params.rawCredential
                })
              }
            />
          )
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE}
        component={SSICredentialSelectTypeScreen}
        options={({ route }) => ({
          headerTitle: translate('credential_select_type_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={format(translate('credential_select_type_subtitle'), route.params.issuer)}
            />
          )
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_RAW_JSON}
        component={SSICredentialRawJson}
        options={{
          headerTitle: translate('raw_credential_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props} showBackButton={Platform.OS === PlatformsEnum.IOS} />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={{
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} />
        }}
      />
    </Stack.Navigator>
  )
}

// TODO need a temp screen here else navigating to this stack will give errors
const NotificationsStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.CREDENTIALS_OVERVIEW}
      screenOptions={{
        animation: 'none'
      }}
    >
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIALS_OVERVIEW}
        component={SSICredentialsOverviewScreen}
        options={{
          headerTitle: translate('credentials_overview_title'),
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} showBorder={true} />
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={{
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} />
        }}
      />
    </Stack.Navigator>
  )
}
