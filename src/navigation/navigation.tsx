import {BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator, NativeStackHeaderProps} from '@react-navigation/native-stack';
import Debug, {Debugger} from 'debug';
import React, {useEffect} from 'react';
import Toast from 'react-native-toast-message';
import {APP_ID, EMERGENCY_ALERT_DELAY} from '../@config/constants';
import {toastConfig, toastsAutoHide, toastsBottomOffset, toastsVisibilityTime} from '../@config/toasts';
import SSIHeaderBar from '../components/bars/SSIHeaderBar';
import SSINavigationBar from '../components/bars/SSINavigationBar';
import {translate} from '../localization/Localization';
import {OnboardingMachine} from '../machines/onboardingMachine';
import SSIAlertModal from '../modals/SSIAlertModal';
import SSIPopupModal from '../modals/SSIPopupModal';
import RootNavigation from '../navigation/rootNavigation';
import SSIPersonalDataScreen from '../screens/Onboarding/SSIPersonalDataScreen';
import SSIPinCodeSetScreen from '../screens/Onboarding/SSIPinCodeSetScreen';
import SSIPinCodeVerifyScreen from '../screens/Onboarding/SSIPinCodeVerifyScreen';
import SSIOnboardingSummaryScreen from '../screens/Onboarding/SSISummaryScreen';
import SSITermsOfServiceScreen from '../screens/Onboarding/SSITermsOfServiceScreen';
import SSIWelcomeScreen from '../screens/Onboarding/SSIWelcomeScreen';
import OpenBrowserScreen from '../screens/OpenBrowserScreen';
import SSIContactAddScreen from '../screens/SSIContactAddScreen';
import SSIContactDetailsScreen from '../screens/SSIContactDetailsScreen';
import SSIContactsOverviewScreen from '../screens/SSIContactsOverviewScreen';
import CredentialDetailsScreen from '../screens/CredentialDetailsScreen';
import SSICredentialRawJsonScreen from '../screens/SSICredentialRawJsonScreen';
import SSICredentialsSelectScreen from '../screens/SSICredentialSelectScreen';
import SSICredentialSelectTypeScreen from '../screens/SSICredentialSelectTypeScreen';
import CredentialsOverviewScreen from '../screens/CredentialsOverviewScreen';
import CredentialsRequiredScreen from '../screens/CredentialsRequiredScreen';
import SSIErrorScreen from '../screens/SSIErrorScreen';
import SSILoadingScreen from '../screens/SSILoadingScreen';
import SSILockScreen from '../screens/SSILockScreen';
import SSINotificationsOverviewScreen from '../screens/SSINotificationsOverviewScreen';
import SSIQRReaderScreen from '../screens/SSIQRReaderScreen';
import SSIVerificationCodeScreen from '../screens/SSIVerificationCodeScreen';
import Veramo from '../screens/Veramo';
import {login, walletAuthLockState} from '../services/authenticationService';
import {OID4VCIProvider} from './machines/oid4vciStateNavigation';
import {OnboardingProvider} from './machines/onboardingStateNavigation';
import {SiopV2Provider} from './machines/siopV2StateNavigation';
import {
  HeaderMenuIconsEnum,
  IOnboardingProps,
  // IOID4VCIProps,
  MainRoutesEnum,
  NavigationBarRoutesEnum,
  ScreenRoutesEnum,
  StackParamList,
  SwitchRoutesEnum,
  WalletAuthLockState,
  ISiopV2PProps,
} from '../types';
import {OnboardingMachineInterpreter} from '../types/machines/onboarding';
import EmergencyScreen from '../screens/EmergencyScreen';

const debug: Debugger = Debug(`${APP_ID}:navigation`);

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
      <Stack.Screen
        name={MainRoutesEnum.OID4VCI}
        children={() => (
          <>
            <OID4VCIStackWithContext />
            <Toast bottomOffset={toastsBottomOffset} autoHide={toastsAutoHide} visibilityTime={toastsVisibilityTime} config={toastConfig} />
          </>
        )}
      />
      <Stack.Screen
        name={MainRoutesEnum.SIOPV2}
        children={() => (
          <>
            <SiopV2StackWithContext />
            <Toast bottomOffset={toastsBottomOffset} autoHide={toastsAutoHide} visibilityTime={toastsVisibilityTime} config={toastConfig} />
          </>
        )}
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
        component={CredentialsOverviewScreen}
        options={{
          headerTitle: translate('credentials_overview_title'),
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} showBorder showBackButton={false} />,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_DETAILS}
        component={CredentialDetailsScreen}
        options={({route}) => ({
          headerTitle: translate('credential_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              // TODO create actions that can be passed in
              moreActions={[
                {
                  caption: translate('show_raw_credential_button_caption'),
                  onPress: async (): Promise<void> =>
                    RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                      rawCredential: route.params.rawCredential,
                    }),
                  icon: HeaderMenuIconsEnum.DOWNLOAD,
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
        component={SSIQRReaderScreen}
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
              headerSubTitle={translate('verification_code_subtitle', {credentialName: route.params.credentialName})}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_DETAILS}
        component={CredentialDetailsScreen}
        options={({route}) => ({
          headerTitle: route.params.headerTitle ? route.params.headerTitle : translate('credential_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('credential_details_subtitle')}
              // TODO create actions that can be passed in
              moreActions={[
                {
                  caption: translate('show_raw_credential_button_caption'),
                  onPress: async (): Promise<void> =>
                    RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                      rawCredential: route.params.rawCredential,
                    }),
                  icon: HeaderMenuIconsEnum.DOWNLOAD,
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
        component={CredentialsRequiredScreen}
        options={({route}) => ({
          headerTitle: translate('credentials_required_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={`${translate('credentials_required_subtitle', {verifierName: route.params.verifierName})} ${
                route.params.presentationDefinition.purpose && `\n\n${route.params.presentationDefinition.purpose}`
              }`}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIALS_SELECT}
        component={SSICredentialsSelectScreen}
        options={({route}) => ({
          headerTitle: translate('credentials_select_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={`${translate('credentials_select_subtitle')} ${route.params.purpose && `\n\n${route.params.purpose}`}`}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.LOADING}
        component={SSILoadingScreen}
        options={{
          headerShown: false,
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
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} headerSubTitle={translate('authentication_pin_code_subtitle')} />,
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

export const OnboardingStack = (): JSX.Element => {
  return (
    <Stack.Navigator
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
        options={({route}) => ({
          headerTitle: translate('terms_of_service_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={translate('terms_of_service_subtitle')}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.PERSONAL_DATA}
        component={SSIPersonalDataScreen}
        options={({route}) => ({
          headerTitle: translate('personal_data_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={translate('personal_data_subtitle')}
            />
          ),
        })}
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
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={translate('pin_code_choose_pin_code_subtitle')}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.PIN_CODE_VERIFY}
        component={SSIPinCodeVerifyScreen}
        options={({route}) => ({
          // unmountOnBlur resets the screen back to initial state
          unmountOnBlur: true,
          headerTitle: translate('pin_code_confirm_pin_code_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={translate('pin_code_confirm_pin_code_subtitle')}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ONBOARDING_SUMMARY}
        component={SSIOnboardingSummaryScreen}
        options={({route}) => ({
          headerTitle: translate('onboard_summary_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              showProfileIcon={false}
              headerSubTitle={translate('onboard_summary_subtitle')}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.LOADING}
        component={SSILoadingScreen}
        options={{
          headerShown: false,
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
          // FIXME WAL-681 https://github.com/react-navigation/react-navigation/issues/11139
          // navigationBarColor: '#202537',
          headerTitle: translate('lock_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar {...props} showBackButton={false} showProfileIcon={false} headerSubTitle={translate('lock_subtitle')} />
          ),
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.EMERGENCY}
        component={EmergencyScreen}
        options={{
          // FIXME WAL-681 https://github.com/react-navigation/react-navigation/issues/11139
          // navigationBarColor: '#D74500',
          headerTitle: translate('emergency_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // FIXME add colors to ui-components once we merge this functionality
              backgroundColor={'#D74500'}
              showProfileIcon={false}
              headerSubTitle={translate('emergency_subtitle', {emergencyAlertDelay: EMERGENCY_ALERT_DELAY})}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export const OnboardingStackScreenWithContext = (props: IOnboardingProps): JSX.Element => {
  return (
    <OnboardingProvider customOnboardingInstance={props?.customOnboardingInstance}>
      <OnboardingStack />
    </OnboardingProvider>
  );
};

export const OID4VCIStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.LOADING}
        component={SSILoadingScreen}
        initialParams={{message: translate('action_getting_information_message')}}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.BROWSER_OPEN}
        component={OpenBrowserScreen}
        options={({route}) => ({
          // headerTitle: translate('browser_open_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // headerSubTitle={translate('browser_open_subtitle')}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CONTACT_ADD}
        component={SSIContactAddScreen}
        options={({route}) => ({
          headerTitle: translate('contact_add_new_contact_detected_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('contact_add_new_contact_detected_subtitle')}
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
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('credential_select_type_subtitle', {issuerName: route.params.issuer})}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.VERIFICATION_CODE}
        component={SSIVerificationCodeScreen}
        options={({route}) => ({
          headerTitle: translate('verification_code_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('verification_code_subtitle', {credentialName: route.params.credentialName})}
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
        name={ScreenRoutesEnum.CREDENTIAL_DETAILS}
        component={CredentialDetailsScreen}
        options={({route}) => ({
          headerTitle: route.params.headerTitle ? route.params.headerTitle : translate('credential_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('credential_details_subtitle')}
              // TODO create actions that can be passed in
              moreActions={[
                {
                  caption: translate('show_raw_credential_button_caption'),
                  onPress: async (): Promise<void> =>
                    RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                      rawCredential: route.params.rawCredential,
                    }),
                  icon: HeaderMenuIconsEnum.DOWNLOAD,
                },
              ]}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={({route}) => ({
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} onBack={route.params.onBack} />,
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.LOCK}
        component={SSILockScreen}
        options={{
          headerTitle: translate('authentication_pin_code_title'),
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} headerSubTitle={translate('authentication_pin_code_subtitle')} />,
        }}
      />
    </Stack.Navigator>
  );
};

export const OID4VCIStackWithContext = (): JSX.Element => {
  return (
    <OID4VCIProvider>
      <OID4VCIStack />
    </OID4VCIProvider>
  );
};

export const SiopV2Stack = (): JSX.Element => {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.LOADING}
        component={SSILoadingScreen}
        initialParams={{message: translate('action_getting_information_message')}}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CONTACT_ADD}
        component={SSIContactAddScreen}
        options={({route}) => ({
          headerTitle: translate('contact_add_new_contact_detected_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('contact_add_new_contact_detected_subtitle')}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIALS_REQUIRED}
        component={CredentialsRequiredScreen}
        options={({route}) => ({
          headerTitle: translate('credentials_required_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={`${translate('credentials_required_subtitle', {verifierName: route.params.verifierName})} ${
                route.params.presentationDefinition.purpose && `\n\n${route.params.presentationDefinition.purpose}`
              }`}
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
        name={ScreenRoutesEnum.CREDENTIALS_SELECT}
        component={SSICredentialsSelectScreen}
        options={({route}) => ({
          headerTitle: translate('credentials_select_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={`${translate('credentials_select_subtitle')} ${route.params.purpose && `\n\n${route.params.purpose}`}`}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_DETAILS}
        component={CredentialDetailsScreen}
        options={({route}) => ({
          headerTitle: route.params.headerTitle ? route.params.headerTitle : translate('credential_details_title'),
          header: (props: NativeStackHeaderProps) => (
            <SSIHeaderBar
              {...props}
              onBack={route.params.onBack}
              // TODO rethink back button visibility for Android
              //showBackButton={Platform.OS === PlatformsEnum.IOS}
              headerSubTitle={translate('credential_details_subtitle')}
              // TODO create actions that can be passed in
              moreActions={[
                {
                  caption: translate('show_raw_credential_button_caption'),
                  onPress: async (): Promise<void> =>
                    RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                      rawCredential: route.params.rawCredential,
                    }),
                  icon: HeaderMenuIconsEnum.DOWNLOAD,
                },
              ]}
            />
          ),
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.ERROR}
        component={SSIErrorScreen}
        options={({route}) => ({
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} onBack={route.params.onBack} />,
        })}
      />
      <Stack.Screen
        name={ScreenRoutesEnum.LOCK}
        component={SSILockScreen}
        options={{
          headerTitle: translate('authentication_pin_code_title'),
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} headerSubTitle={translate('authentication_pin_code_subtitle')} />,
        }}
      />
    </Stack.Navigator>
  );
};

export const SiopV2StackWithContext = (props: ISiopV2PProps): JSX.Element => {
  return (
    <SiopV2Provider customSiopV2Instance={props.customSiopV2Instance}>
      <SiopV2Stack />
    </SiopV2Provider>
  );
};

/**
 * Solution below allows to navigate based on the redux state. so there is no need to specifically navigate to another stack, as setting the state does that already
 * https://reactnavigation.org/docs/auth-flow/
 */
const AppNavigator = (): JSX.Element => {
  const lockState: WalletAuthLockState = walletAuthLockState();

  if (lockState === WalletAuthLockState.ONBOARDING) {
    if (!OnboardingMachine.hasInstance()) {
      OnboardingMachine.getInstance({requireCustomNavigationHook: false});
    }
  }

  useEffect((): void => {
    if (!RootNavigation.isReady()) {
      debug(`app or navigation not ready (yet)`);
      return;
    } else if (lockState !== WalletAuthLockState.ONBOARDING) {
      debug(`app is not in onboarding state`);
      return;
    }
    debug(`app and navigation ready`);

    // Existing instance is already created by the provider. So we make sure by requiring an existing instance
    const onboardingInstance: OnboardingMachineInterpreter = OnboardingMachine.getInstance({requireExisting: true});
    const snapshot = onboardingInstance.getSnapshot();
    if (!snapshot || snapshot.done || snapshot.events.length === 0) {
      debug(`ONBOARDING starting...`);
      onboardingInstance.start();
      debug(`ONBOARDING started`);
    }
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'none',
        headerShown: false,
      }}>
      {lockState === WalletAuthLockState.ONBOARDING ? (
        <Stack.Screen
          name={SwitchRoutesEnum.ONBOARDING}
          component={OnboardingStackScreenWithContext}
          initialParams={{
            customOnboardingInstance: OnboardingMachine.getInstance({requireExisting: true}),
          }}
        />
      ) : lockState === WalletAuthLockState.AUTHENTICATED ? (
        <Stack.Screen name={SwitchRoutesEnum.MAIN} component={MainStackNavigator} />
      ) : (
        <Stack.Screen name={SwitchRoutesEnum.AUTHENTICATION} component={AuthenticationStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
