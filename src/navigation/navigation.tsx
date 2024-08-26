import {BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NativeStackHeaderProps, createNativeStackNavigator} from '@react-navigation/native-stack';
import Debug, {Debugger} from 'debug';
import React, {useContext, useEffect} from 'react';
import Toast from 'react-native-toast-message';
import {APP_ID, EMERGENCY_ALERT_DELAY} from '../@config/constants';
import {toastConfig, toastsAutoHide, toastsBottomOffset, toastsVisibilityTime} from '../@config/toasts';
import OnboardingHeader from '../components/bars/OnboardingHeader';
import SSIHeaderBar from '../components/bars/SSIHeaderBar';
import SSINavigationBar from '../components/bars/SSINavigationBar';
import {translate} from '../localization/Localization';
import {OnboardingMachine} from '../machines/onboardingMachine';
import SSIAlertModal from '../modals/SSIAlertModal';
import SSIPopupModal from '../modals/SSIPopupModal';
import RootNavigation from '../navigation/rootNavigation';
import CredentialDetailsScreen from '../screens/CredentialDetailsScreen';
import CredentialsOverviewScreen from '../screens/CredentialsOverviewScreen';
import CredentialsRequiredScreen from '../screens/CredentialsRequiredScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import {
  AcceptTermsAndPrivacyScreen,
  EnableBiometricsScreen,
  EnterCountryScreen,
  EnterEmailScreen,
  EnterNameScreen,
  EnterPinCodeScreen,
  ImportDataAuthenticationScreen,
  ImportDataConsentScreen,
  ImportDataFinalScreen,
  ImportDataLoaderScreen,
  ImportPersonalDataScreen,
  ReadTermsAndPrivacyScreen,
  ShowProgressScreen,
  VerifyPinCodeScreen,
  WelcomeScreen,
} from '../screens/Onboarding';
import OpenBrowserScreen from '../screens/OpenBrowserScreen';
import SSIContactAddScreen from '../screens/SSIContactAddScreen';
import SSIContactDetailsScreen from '../screens/SSIContactDetailsScreen';
import SSIContactsOverviewScreen from '../screens/SSIContactsOverviewScreen';
import SSICredentialRawJsonScreen from '../screens/SSICredentialRawJsonScreen';
import SSICredentialsSelectScreen from '../screens/SSICredentialSelectScreen';
import SSICredentialSelectTypeScreen from '../screens/SSICredentialSelectTypeScreen';
import SSIErrorScreen from '../screens/SSIErrorScreen';
import SSILoadingScreen from '../screens/SSILoadingScreen';
import SSILockScreen from '../screens/SSILockScreen';
import SSINotificationsOverviewScreen from '../screens/SSINotificationsOverviewScreen';
import SSIQRReaderScreen from '../screens/SSIQRReaderScreen';
import SSIVerificationCodeScreen from '../screens/SSIVerificationCodeScreen';
import LoadingScreen from '../screens/Share/LoadingScreen';
import ScanQrScreen from '../screens/Share/ScanQrScreen';
import SelectCredentialsScreen from '../screens/Share/SelectCredentialsScreen';
import ShareVerifyPinCodeScreen from '../screens/Share/VerifyPinCodeScreen';
import Veramo from '../screens/Veramo';
import {login, walletAuthLockState} from '../services/authenticationService';
import {
  HeaderMenuIconsEnum,
  ISiopV2PProps,
  MainRoutesEnum,
  NavigationBarRoutesEnum,
  OnboardingStackParamsList,
  ScreenRoutesEnum,
  ShareStackParamsList,
  StackParamList,
  SwitchRoutesEnum,
  WalletAuthLockState,
} from '../types';
import {OnboardingMachineInterpreter} from '../types/machines/onboarding';
import {ShareMachineEvents} from '../types/machines/share';
import {OID4VCIProvider} from './machines/oid4vciStateNavigation';
import {OnboardingProvider} from './machines/onboardingStateNavigation';
import {ShareContext, ShareProvider} from './machines/shareStateNavigation';
import {SiopV2Provider} from './machines/siopV2StateNavigation';
import CredentialCatalogScreen from '../screens/CredentialCatalogScreen';
import AusweisModal from '../modals/AusweisModal';
import IncorrectInformationScreen from '../screens/Onboarding/IncorrectInformationScreen';
import CompleteOnboardingScreen from '../screens/Onboarding/CompleteOnboardingScreen';

const debug: Debugger = Debug(`${APP_ID}:navigation`);

const Stack = createNativeStackNavigator<StackParamList>();
const OnboardingBaseStack = createNativeStackNavigator<OnboardingStackParamsList>();
const ShareBaseStack = createNativeStackNavigator<ShareStackParamsList>();

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
        name={MainRoutesEnum.AUSWEIS_MODAL}
        component={AusweisModal}
        options={{
          presentation: 'transparentModal',
          headerShown: false,
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

export const ShareStack = (): JSX.Element => {
  const {shareInstance} = useContext(ShareContext);
  return (
    <ShareBaseStack.Navigator
      screenOptions={{
        animation: 'none',
        header: props => <SSIHeaderBar {...props} onBack={() => void shareInstance.send(ShareMachineEvents.PREVIOUS)} />,
      }}>
      <ShareBaseStack.Screen name="ScanQr" component={ScanQrScreen} options={{headerShown: false}} />
      <ShareBaseStack.Screen name="SelectCredentials" component={SelectCredentialsScreen} />
      <ShareBaseStack.Screen name="VerifyPinCode" component={ShareVerifyPinCodeScreen} />
      <ShareBaseStack.Screen name="ShareLoading" component={LoadingScreen} options={{headerShown: false}} />
      <ShareBaseStack.Screen name="QrLoading" component={LoadingScreen} options={{headerShown: false}} />
    </ShareBaseStack.Navigator>
  );
};

export const ShareStackScreenWithContext = (props: any): JSX.Element => {
  return <ShareProvider />;
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
            <ShareStackScreenWithContext />
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
        name={NavigationBarRoutesEnum.CREDENTIAL_CATALOG}
        children={() => (
          <>
            <CredentialCatalogStack />
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

type StackGroupConfig = {
  titleKey: string;
  screens: {
    name: any;
    component: React.FC<any>;
  }[];
};

const CredentialCatalogStack = (): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenRoutesEnum.CREDENTIAL_CATALOG}
      screenOptions={{
        animation: 'none',
      }}>
      <Stack.Screen
        name={ScreenRoutesEnum.CREDENTIAL_CATALOG}
        component={CredentialCatalogScreen}
        options={{
          headerTitle: 'Credential Catalog', // TODO
          header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} showBackButton={false} />,
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

const step1GroupConfig: StackGroupConfig = {
  titleKey: 'onboard_create_wallet_step_title',
  screens: [
    {
      name: 'EnterName',
      component: EnterNameScreen,
    },
    {
      name: 'EnterEmailAddress',
      component: EnterEmailScreen,
    },
    {
      name: 'EnterCountry',
      component: EnterCountryScreen,
    },
  ],
};

const step2GroupConfig: StackGroupConfig = {
  titleKey: 'onboard_secure_wallet_step_title',
  screens: [
    {
      name: 'EnterPinCode',
      component: EnterPinCodeScreen,
    },
    {
      name: 'VerifyPinCode',
      component: VerifyPinCodeScreen,
    },
    {
      name: 'EnableBiometrics',
      component: EnableBiometricsScreen,
    },
    {
      name: 'AcceptTermsAndPrivacy',
      component: AcceptTermsAndPrivacyScreen,
    },
  ],
};

const step3GroupConfig: StackGroupConfig = {
  titleKey: 'import_data_title',
  screens: [
    {
      name: 'ImportDataConsent',
      component: ImportDataConsentScreen,
    },
    {
      name: 'ImportPersonalData',
      component: ImportPersonalDataScreen,
    },
    {
      name: 'ImportDataAuthentication',
      component: ImportDataAuthenticationScreen,
    },
    {
      name: 'ImportDataLoader',
      component: ImportDataLoaderScreen,
    },
    {
      name: 'ImportDataFinal',
      component: ImportDataFinalScreen,
    },
  ],
};

const stackGroupsConfig = [step1GroupConfig, step2GroupConfig, step3GroupConfig];

export const OnboardingStack = (): JSX.Element => (
  <OnboardingBaseStack.Navigator screenOptions={{animation: 'none'}}>
    <OnboardingBaseStack.Screen name="Welcome" component={WelcomeScreen} options={{headerShown: false}} />
    <OnboardingBaseStack.Screen name="ShowProgress" component={ShowProgressScreen} options={{header: OnboardingHeader}} />
    <OnboardingBaseStack.Screen name="ReadTermsAndPrivacy" component={ReadTermsAndPrivacyScreen} options={{header: OnboardingHeader}} />
    <OnboardingBaseStack.Screen name="IncorrectPersonalData" component={IncorrectInformationScreen} options={{header: OnboardingHeader}} />
    <OnboardingBaseStack.Screen name="CompleteOnboarding" component={CompleteOnboardingScreen} options={{headerShown: false}} />
    {stackGroupsConfig.map(group => (
      <OnboardingBaseStack.Group key={group.titleKey}>
        {group.screens.map(({name, component}, index) => (
          <OnboardingBaseStack.Screen
            key={name}
            name={name}
            component={component}
            options={{
              header: props => (
                <OnboardingHeader
                  {...props}
                  title={translate(group.titleKey)}
                  stepConfig={{
                    current: index + 1,
                    total: group.screens.length,
                  }}
                />
              ),
            }}
          />
        ))}
      </OnboardingBaseStack.Group>
    ))}
    <OnboardingBaseStack.Screen
      name={ScreenRoutesEnum.ERROR}
      component={SSIErrorScreen}
      options={({route}) => ({
        header: (props: NativeStackHeaderProps) => <SSIHeaderBar {...props} onBack={route.params.onBack} />,
      })}
    />
  </OnboardingBaseStack.Navigator>
);

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

export const OnboardingStackScreenWithContext = (props: any): JSX.Element => (
  <OnboardingProvider customOnboardingInstance={props?.params?.customOnboardingInstance}>
    <OnboardingStack />
  </OnboardingProvider>
);

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
