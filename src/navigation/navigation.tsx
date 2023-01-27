import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator, NativeStackHeaderProps } from '@react-navigation/native-stack'
import React from 'react'
import { Platform } from 'react-native'
import Toast from 'react-native-toast-message'
import { useSelector } from 'react-redux'

import { toastConfig, toastsAutoHide, toastsBottomOffset, toastsVisibilityTime } from '../@config/toasts'
import {
  MainRoutesEnum,
  NavigationBarRoutesEnum,
  PlatformsEnum,
  ScreenRoutesEnum,
  StackParamList,
  SwitchRoutesEnum
} from '../@types'
import SSIHeaderBar from '../components/bars/SSIHeaderBar'
import SSINavigationBar from '../components/bars/SSINavigationBar'
import { translate } from '../localization/Localization'
import SSIAlertModal from '../modals/SSIAlertModal'
import SSIPopupModal from '../modals/SSIPopupModal'
import * as RootNavigation from '../navigation/rootNavigation'
import SSIConnectionDetailsScreen from '../screens/SSIConnectionDetailsScreen'
import SSIConnectionsOverviewScreen from '../screens/SSIConnectionsOverviewScreen'
import SSIContactAddScreen from '../screens/SSIContactAddScreen'
import SSIContactDetailsScreen from '../screens/SSIContactDetailsScreen'
import SSIContactsOverviewScreen from '../screens/SSIContactsOverviewScreen'
import SSICredentialDetailsScreen from '../screens/SSICredentialDetailsScreen'
import SSICredentialRawJsonScreen from '../screens/SSICredentialRawJsonScreen'
import SSICredentialSelectTypeScreen from '../screens/SSICredentialSelectTypeScreen'
import SSICredentialsOverviewScreen from '../screens/SSICredentialsOverviewScreen'
import SSIErrorScreen from '../screens/SSIErrorScreen'
import SSIOnboardingWelcomeScreen from '../screens/SSIOnboardingWelcomeScreen'
import SSIPEXVerificationScreen from '../screens/SSIPEXVerificationScreen'
import SSIQRReader from '../screens/SSIQRReaderScreen'
import SSIVerificationCodeScreen from '../screens/SSIVerificationCodeScreen'
import Veramo from '../screens/Veramo'
import { RootState } from '../store'
import SSITermsOfServiceScreen from '../screens/SSITermsOfServiceScreen';

const format = require('string-format')

const Stack = createNativeStackNavigator<StackParamList>()
const Tab = createBottomTabNavigator()

const MainStackNavigator = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={MainRoutesEnum.HOME}
      screenOptions={{
        animation: 'none',
        headerShown: false
      }}
    >
      <Stack.Screen name={MainRoutesEnum.HOME} component={TabStackNavigator} />
      <Stack.Screen
        name={MainRoutesEnum.ALERT_MODAL}
        children={({ navigation, route }) => (
          <>
            <SSIAlertModal navigation={navigation} route={route} />
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
        name={MainRoutesEnum.POPUP_MODAL}
        children={({ navigation, route }) => (
          <>
            <SSIPopupModal navigation={navigation} route={route} />
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

const TabStackNavigator = (): JSX.Element => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // unmountOnBlur resets the stack back to initial state
        unmountOnBlur: true
      }}
      tabBar={(props: BottomTabBarProps) => <SSINavigationBar {...props} />}
      initialRouteName={NavigationBarRoutesEnum.CREDENTIALS}
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
        name={NavigationBarRoutesEnum.CREDENTIALS}
        children={() => (
          <>
            <CredentialsStack />
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
        name={NavigationBarRoutesEnum.CONTACTS}
        children={() => (
          <>
            <ContactsStack />
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

const CredentialsStack = (): JSX.Element => {
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
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} showBorder />
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
        component={SSICredentialRawJsonScreen}
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

const ContactsStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.CONNECTIONS_OVERVIEW}
      screenOptions={{
        animation: 'none'
      }}
    >
      <Stack.Screen
        name={ScreenRoutesEnum.CONTACTS_OVERVIEW}
        component={SSIContactsOverviewScreen}
        options={{
          headerTitle: translate('contacts_overview_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props} showBackButton={Platform.OS === PlatformsEnum.IOS} moreButtonAction={async () => console.log('more pressed')} showBorder />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CONTACT_DETAILS}
        component={SSIContactDetailsScreen}
        options={{
          headerTitle: translate('contact_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props} showBackButton={Platform.OS === PlatformsEnum.IOS} moreButtonAction={async () => console.log('more pressed')} showBorder />
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
              moreButtonAction={async () => console.log('more pressed')}
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
        component={SSICredentialRawJsonScreen}
        options={{
          headerTitle: translate('raw_credential_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props} showBackButton={Platform.OS === PlatformsEnum.IOS} />
          )
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CONTACT_ADD}
        component={SSIContactAddScreen}
        options={{
          headerTitle: translate('contact_add_new_contact_detected_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('contact_add_new_contact_detected_subtitle')}
            />
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
              moreButtonAction={async () => console.log('more pressed')}
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
            <SSIHeaderBar {...props} showBackButton={Platform.OS === PlatformsEnum.IOS} moreButtonAction={async () => console.log('more pressed')} />
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

const OnboardingStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.ONBOARDING_WELCOME}
      screenOptions={{
        animation: 'none'
      }}
    >
      <Stack.Screen
        name={ScreenRoutesEnum.ONBOARDING_WELCOME}
        component={SSIOnboardingWelcomeScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
          name={ScreenRoutesEnum.TERMS_OF_SERVICE}
          component={SSITermsOfServiceScreen}
          options={{
            headerTitle: 'Terms of service',
            header: (props: NativeStackHeaderProps) => (
                <SSIHeaderBar
                    {...props}
                    showBackButton={Platform.OS === PlatformsEnum.IOS}
                    headerSubTitle={'This document was last updated on January 5, 2023.'}
                />
            )
          }}
      />
      <Stack.Screen
        name={MainRoutesEnum.POPUP_MODAL}
        component={SSIPopupModal}
        options={{
          presentation: 'transparentModal',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  )
}

/**
 * WIP. Figuring out how to properly navigate between certain flows and making sure that the user cannot navigate back to the previous ones
 * Solution below allows to navigate based on the redux state. so there is no need to specifically navigate to another stack, as setting the state does that already
 * https://reactnavigation.org/docs/auth-flow/
 */
const AppNavigator = (): JSX.Element => {
  const userPresent = useSelector((state: RootState) => !!state.user.name)

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'none',
        headerShown: false
      }}
    >
      {!userPresent ? (
        <Stack.Screen name={SwitchRoutesEnum.ONBOARDING} component={OnboardingStack} />
      ) : (
        <Stack.Screen name={SwitchRoutesEnum.MAIN} component={MainStackNavigator} />
      )}
    </Stack.Navigator>
  )
}

export default AppNavigator
