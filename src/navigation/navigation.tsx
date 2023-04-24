import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackHeaderProps } from '@react-navigation/native-stack';
import React from 'react';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

import { toastConfig, toastsAutoHide, toastsBottomOffset, toastsVisibilityTime } from '../@config/toasts';
import SSIHeaderBar from '../components/bars/SSIHeaderBar';
import SSINavigationBar from '../components/bars/SSINavigationBar';
import { translate } from '../localization/Localization';
import SSIAlertModal from '../modals/SSIAlertModal';
import SSIPopupModal from '../modals/SSIPopupModal';
import RootNavigation from '../navigation/rootNavigation';
import SSIContactAddScreen from '../screens/SSIContactAddScreen';
import SSIContactDetailsScreen from '../screens/SSIContactDetailsScreen';
import SSIContactsOverviewScreen from '../screens/SSIContactsOverviewScreen';
import SSICredentialDetailsScreen from '../screens/SSICredentialDetailsScreen';
import SSICredentialRawJsonScreen from '../screens/SSICredentialRawJsonScreen';
import SSICredentialsSelectScreen from '../screens/SSICredentialSelectScreen';
import SSICredentialSelectTypeScreen from '../screens/SSICredentialSelectTypeScreen';
import SSICredentialsOverviewScreen from '../screens/SSICredentialsOverviewScreen';
import SSICredentialsRequiredScreen from '../screens/SSICredentialsRequiredScreen'
import SSIErrorScreen from '../screens/SSIErrorScreen';
import SSILockScreen from '../screens/SSILockScreen';
import SSINotificationsOverviewScreen from '../screens/SSINotificationsOverviewScreen';
import SSIPersonalDataScreen from '../screens/SSIPersonalDataScreen';
import SSIPinCodeSetScreen from '../screens/SSIPinCodeSetScreen';
import SSIQRReader from '../screens/SSIQRReaderScreen';
import SSIOnboardingSummaryScreen from '../screens/SSISummaryScreen';
import SSITermsOfServiceScreen from '../screens/SSITermsOfServiceScreen';
import SSIVerificationCodeScreen from '../screens/SSIVerificationCodeScreen';
import SSIWelcomeScreen from '../screens/SSIWelcomeScreen';
import Veramo from '../screens/Veramo';
import {
  MainRoutesEnum,
  NavigationBarRoutesEnum,
  RootState,
  ScreenRoutesEnum,
  StackParamList,
  SwitchRoutesEnum
} from '../types';
import { login } from '../services/authenticationService'

const format = require('string-format');

const Stack = createNativeStackNavigator<StackParamList>();
const Tab = createBottomTabNavigator();

const MainStackNavigator = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={MainRoutesEnum.HOME}
      screenOptions={{
        animation: 'none',
        headerShown: false,
      }}>
      <Stack.Screen name={MainRoutesEnum.HOME} component={TabStackNavigator} />
      <Stack.Screen
        name={MainRoutesEnum.ALERT_MODAL}
        children={({navigation, route}) => (
          <>
            <SSIAlertModal navigation={navigation} route={route} />
            <Toast bottomOffset={toastsBottomOffset} autoHide={toastsAutoHide} visibilityTime={toastsVisibilityTime} config={toastConfig} />
          </>
        )}
        options={{
          presentation: 'transparentModal',
        }}
      />
      <Stack.Screen
        // TODO WAL-541 fix navigation hierarchy
        name={MainRoutesEnum.POPUP_MODAL}
        children={({navigation, route}) => (
          <>
            <SSIPopupModal navigation={navigation} route={route} />
            <Toast bottomOffset={toastsBottomOffset} autoHide={toastsAutoHide} visibilityTime={toastsVisibilityTime} config={toastConfig} />
          </>
        )}
        options={{
          presentation: 'transparentModal',
        }}
      />
      <Stack.Screen name="Veramo" component={Veramo} />
    </Stack.Navigator>
  );
};

const TabStackNavigator = (): JSX.Element => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // unmountOnBlur resets the stack back to initial state
        unmountOnBlur: true,
      }}
      tabBar={(props: BottomTabBarProps) => <SSINavigationBar {...props} />}
      initialRouteName={NavigationBarRoutesEnum.CREDENTIALS}
      backBehavior="none">
      <Tab.Screen
        name={NavigationBarRoutesEnum.QR}
        children={() => (
          <>
            <QRStack />
            <Toast bottomOffset={toastsBottomOffset} autoHide={toastsAutoHide} visibilityTime={toastsVisibilityTime} config={toastConfig} />
          </>
        )}
      />
      <Tab.Screen
        name={NavigationBarRoutesEnum.NOTIFICATIONS}
        children={() => (
          <>
            <NotificationsStack />
            <Toast bottomOffset={toastsBottomOffset} autoHide={toastsAutoHide} visibilityTime={toastsVisibilityTime} config={toastConfig} />
          </>
        )}
      />
      <Tab.Screen
        name={NavigationBarRoutesEnum.CREDENTIALS}
        children={() => (
          <>
            <CredentialsStack />
            <Toast bottomOffset={toastsBottomOffset} autoHide={toastsAutoHide} visibilityTime={toastsVisibilityTime} config={toastConfig} />
          </>
        )}
      />
      <Tab.Screen
        name={NavigationBarRoutesEnum.CONTACTS}
        children={() => (
          <>
            <ContactsStack />
            <Toast bottomOffset={toastsBottomOffset} autoHide={toastsAutoHide} visibilityTime={toastsVisibilityTime} config={toastConfig} />
          </>
        )}
      />
    </Tab.Navigator>
  );
};

const CredentialsStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.CREDENTIALS_OVERVIEW}
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIALS_OVERVIEW}
        component={SSICredentialsOverviewScreen}
        options={{
          headerTitle: translate('credentials_overview_title'),
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} showBorder showBackButton={false} />,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_DETAILS}
        component={SSICredentialDetailsScreen}
        options={({route}) => ({
          headerTitle: translate('credential_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              moreActions={[
                {
                  caption: translate('show_raw_credential_button_caption'),
                  onPress: async () =>
                    RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                      rawCredential: route.params.rawCredential,
                    }),
                },
              ]}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_RAW_JSON}
        component={SSICredentialRawJsonScreen}
        options={{
          headerTitle: translate('raw_credential_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={{
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} />,
        }}
      />
    </Stack.Navigator>
  );
};

const ContactsStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.CONTACTS_OVERVIEW}
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.CONTACTS_OVERVIEW}
        component={SSIContactsOverviewScreen}
        options={{
          headerTitle: translate('contacts_overview_title'),
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} showBackButton={false} showBorder />,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CONTACT_DETAILS}
        component={SSIContactDetailsScreen}
        options={{
          headerTitle: translate('contact_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showBorder
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={{
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} />,
        }}
      />
    </Stack.Navigator>
  );
};

const QRStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.QR_READER}
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.QR_READER}
        component={SSIQRReader}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.VERIFICATION_CODE}
        component={SSIVerificationCodeScreen}
        options={({route}) => ({
          headerTitle: translate('verification_code_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={format(translate('verification_code_subtitle'), route.params.credentialName)}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_DETAILS}
        component={SSICredentialDetailsScreen}
        options={({route}) => ({
          headerTitle: translate('credential_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('credential_details_subtitle')}
              moreActions={[
                {
                  caption: translate('show_raw_credential_button_caption'),
                  onPress: async () =>
                    RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                      rawCredential: route.params.rawCredential,
                    }),
                },
              ]}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE}
        component={SSICredentialSelectTypeScreen}
        options={({route}) => ({
          headerTitle: translate('credential_select_type_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={format(translate('credential_select_type_subtitle'), route.params.issuer)}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_RAW_JSON}
        component={SSICredentialRawJsonScreen}
        options={{
          headerTitle: translate('raw_credential_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
            />
          ),
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
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('contact_add_new_contact_detected_subtitle')}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIALS_REQUIRED}
        component={SSICredentialsRequiredScreen}
        options={({route}) => ({
          headerTitle: translate('credentials_required_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={format(translate('credentials_required_subtitle'), route.params.verifier)}
            />
          ),
        })}
      />
      <Stack.Screen
          name={ScreenRoutesEnum.CREDENTIALS_SELECT}
          component={SSICredentialsSelectScreen}
          options={{
            headerTitle: translate('credentials_select_title'),
            header: (props: NativeStackHeaderProps) => (
                <SSIHeaderBar
                    {...props}
                    // TODO rethink back button visibility for Android
                    //showBackButton={Platform.OS === PlatformsEnum.IOS}
                    headerSubTitle={translate('credentials_select_subtitle')}
                />
            ),
          }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={{
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} />,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.LOCK}
        component={SSILockScreen}
        options={{
          headerTitle: translate('authentication_pin_code_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props}
              headerSubTitle={translate('authentication_pin_code_subtitle')} />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const NotificationsStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.NOTIFICATIONS_OVERVIEW}
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.NOTIFICATIONS_OVERVIEW}
        component={SSINotificationsOverviewScreen}
        options={{
          headerTitle: translate('notifications_overview_title'),
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} showBackButton={false} showBorder />,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={{
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} />,
        }}
      />
    </Stack.Navigator>
  );
};

const OnboardingStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.WELCOME}
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.WELCOME}
        component={SSIWelcomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.TERMS_OF_SERVICE}
        component={SSITermsOfServiceScreen}
        options={{
          headerTitle: translate('terms_of_service_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={translate('terms_of_service_subtitle')}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.PERSONAL_DATA}
        component={SSIPersonalDataScreen}
        options={{
          headerTitle: translate('personal_data_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={translate('personal_data_subtitle')}
            />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.PIN_CODE_SET}
        component={SSIPinCodeSetScreen}
        options={({route}) => ({
          // unmountOnBlur resets the screen back to initial state
          unmountOnBlur: true,
          headerTitle: translate('pin_code_choose_pin_code_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={route.params.headerSubTitle}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ONBOARDING_SUMMARY}
        component={SSIOnboardingSummaryScreen}
        options={{
          headerTitle: translate('onboard_summary_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={translate('onboard_summary_subtitle')}
            />
          ),
        }}
      />
      <Stack.Screen
        name={MainRoutesEnum.POPUP_MODAL}
        component={SSIPopupModal}
        options={{
          presentation: 'transparentModal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const AuthenticationStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.LOCK}
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.LOCK}
        component={SSILockScreen}
        initialParams={{onAuthenticate: login}}
        options={{
          headerTitle: translate('lock_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
                {...props}
                showBackButton={false}
                showProfileIcon={false}
                headerSubTitle={translate('lock_subtitle')}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Solution below allows to navigate based on the redux state. so there is no need to specifically navigate to another stack, as setting the state does that already
 * https://reactnavigation.org/docs/auth-flow/
 */
const AppNavigator = (): JSX.Element => {
  const userState = useSelector((state: RootState) => state.user);
  const onboardingState = useSelector((state: RootState) => state.onboarding);

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'none',
        headerShown: false,
      }}>
      {userState.users.size === 0 ? (
        <Stack.Screen name={SwitchRoutesEnum.ONBOARDING} component={OnboardingStack} />
      ) : !userState.activeUser && !onboardingState.firstName ? ( // Adding a check for any onboarding state here to check if someone is onboarding to skip authentication stack
        <Stack.Screen name={SwitchRoutesEnum.AUTHENTICATION} component={AuthenticationStack} />
      ) : (
        <Stack.Screen name={SwitchRoutesEnum.MAIN} component={MainStackNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
