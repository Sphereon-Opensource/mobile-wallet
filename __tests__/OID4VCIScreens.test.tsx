import {NavigationContainer} from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import {Provider} from 'react-redux';
import {act, ReactTestInstance} from 'react-test-renderer';
import BackHandler from 'react-native/Libraries/Utilities/__mocks__/BackHandler';
import {SimpleEventsOf} from 'xstate';
import {OID4VCIStack, OID4VCIStackWithContext} from '../src/navigation/navigation';
import {navigationRef} from '../src/navigation/rootNavigation';
import OnTouchProvider from '../src/providers/touch/OnTouchProvider';
import store from '../src/store';
import {OID4VCIMachineEvents, OID4VCIMachineInterpreter, OID4VCIMachineStates} from '../src/types/machines/oid4vci';
import {OID4VCIProvider} from '../src/navigation/machines/oid4vciStateNavigation';
import {OID4VCIMachine} from '../src/machines/oid4vciMachine';
import {IOID4VCIProps, IQrData, MainRoutesEnum, QRRoutesEnum, QrTypesEnum, StackParamList} from '../src/types';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SSIAlertModal from '../src/modals/SSIAlertModal';
import Toast from 'react-native-toast-message';
import {toastConfig, toastsAutoHide, toastsBottomOffset, toastsVisibilityTime} from '../src/@config/toasts';
import SSIPopupModal from '../src/modals/SSIPopupModal';
import Veramo from '../src/screens/Veramo';

export const mockPressBack = async (opts?: {oid4vciInstance: OID4VCIMachineInterpreter}): Promise<void> => {
  typeof opts?.oid4vciInstance === 'object'
    ? opts.oid4vciInstance.send(OID4VCIMachineEvents.PREVIOUS as SimpleEventsOf<any>)
    : await act(() => BackHandler.mockPressBack());
};

jest.setTimeout(60 * 1000); // 60 seconds

const Stack = createNativeStackNavigator<StackParamList>();

const MainStackNavigator = (oid4vciInstance: OID4VCIMachineInterpreter): JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={QRRoutesEnum.OID4VCI}
      screenOptions={{
        animation: 'none',
        headerShown: false,
      }}>
      <Stack.Screen
        name={QRRoutesEnum.OID4VCI}
        component={() => (
          <OID4VCIProvider customOID4VCIInstance={oid4vciInstance}>
            <OID4VCIStack />
          </OID4VCIProvider>
        )}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

function xx(oid4vciInstance: OID4VCIMachineInterpreter) {
  return (
    <OID4VCIProvider customOID4VCIInstance={oid4vciInstance}>
      <OID4VCIStack />
    </OID4VCIProvider>
  );
}

function createComponent(oid4vciInstance: OID4VCIMachineInterpreter): JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer
        onReady={(): void => {
          console.log('Navigation is ready');
        }}
        ref={navigationRef}>
        <OnTouchProvider>
          {MainStackNavigator(oid4vciInstance)}
          {/*<OID4VCIProvider customOID4VCIInstance={oid4vciInstance}>*/}
          {/*  <OID4VCIStack />*/}
          {/*</OID4VCIProvider>*/}
        </OnTouchProvider>
      </NavigationContainer>
    </Provider>
  );
} //customOID4VCIInstance={OID4VCIMachine.newInstance()}>

const mockedRequestData: IQrData = {
  type: QrTypesEnum.OPENID_CREDENTIAL_OFFER, // TODO what if we rename the qr service to request service? or is request too ambigious
  credentialOffer: {
    scheme: 'openid-credential-offer',
    baseUrl: 'openid-credential-offer://issuer.portal.walt.id/',
    credential_offer: {
      credential_issuer: 'https://issuer.portal.walt.id',
      credentials: [
        {
          format: 'jwt_vc_json',
          types: ['VerifiableCredential', 'OpenBadgeCredential'],
          credential_definition: {
            '@context': ['https://www.w3.org/2018/credentials/v1', 'https://purl.imsglobal.org/spec/ob/v3p0/context.json'],
            types: ['VerifiableCredential', 'OpenBadgeCredential'],
          },
        },
      ],
      grants: {
        authorization_code: {
          issuer_state: '45528108-4e07-47f4-8ee4-f8c5c854691f',
        },
        'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
          'pre-authorized_code':
            'eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiI0NTUyODEwOC00ZTA3LTQ3ZjQtOGVlNC1mOGM1Yzg1NDY5MWYiLCJpc3MiOiJodHRwczovL2lzc3Vlci5wb3J0YWwud2FsdC5pZCIsImF1ZCI6IlRPS0VOIn0.qam_HsVH7qQPTTb6z88Qnpu8mggxMSTVcAUJdcuAVRxirH1Xk9B0z-aUxrH5EbtS1N1wvZ-rHDkzaVtZSpAHBQ',
          user_pin_required: false,
        },
      },
    },
    original_credential_offer: {
      credential_issuer: 'https://issuer.portal.walt.id',
      credentials: [
        {
          format: 'jwt_vc_json',
          types: ['VerifiableCredential', 'OpenBadgeCredential'],
          credential_definition: {
            '@context': ['https://www.w3.org/2018/credentials/v1', 'https://purl.imsglobal.org/spec/ob/v3p0/context.json'],
            types: ['VerifiableCredential', 'OpenBadgeCredential'],
          },
        },
      ],
      grants: {
        authorization_code: {
          issuer_state: '45528108-4e07-47f4-8ee4-f8c5c854691f',
        },
        'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
          'pre-authorized_code':
            'eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiI0NTUyODEwOC00ZTA3LTQ3ZjQtOGVlNC1mOGM1Yzg1NDY5MWYiLCJpc3MiOiJodHRwczovL2lzc3Vlci5wb3J0YWwud2FsdC5pZCIsImF1ZCI6IlRPS0VOIn0.qam_HsVH7qQPTTb6z88Qnpu8mggxMSTVcAUJdcuAVRxirH1Xk9B0z-aUxrH5EbtS1N1wvZ-rHDkzaVtZSpAHBQ',
          user_pin_required: false,
        },
      },
    },
    supportedFlows: ['Authorization Code Flow', 'Pre-Authorized Code Flow'],
    version: 1011,
    issuerState: '45528108-4e07-47f4-8ee4-f8c5c854691f',
    preAuthorizedCode:
      'eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiI0NTUyODEwOC00ZTA3LTQ3ZjQtOGVlNC1mOGM1Yzg1NDY5MWYiLCJpc3MiOiJodHRwczovL2lzc3Vlci5wb3J0YWwud2FsdC5pZCIsImF1ZCI6IlRPS0VOIn0.qam_HsVH7qQPTTb6z88Qnpu8mggxMSTVcAUJdcuAVRxirH1Xk9B0z-aUxrH5EbtS1N1wvZ-rHDkzaVtZSpAHBQ',
    userPinRequired: false,
  },
  uri: 'openid-credential-offer://issuer.portal.walt.id/?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fissuer.portal.walt.id%22%2C%22credentials%22%3A%5B%7B%22format%22%3A%22jwt_vc_json%22%2C%22types%22%3A%5B%22VerifiableCredential%22%2C%22OpenBadgeCredential%22%5D%2C%22credential_definition%22%3A%7B%22%40context%22%3A%5B%22https%3A%2F%2Fwww.w3.org%2F2018%2Fcredentials%2Fv1%22%2C%22https%3A%2F%2Fpurl.imsglobal.org%2Fspec%2Fob%2Fv3p0%2Fcontext.json%22%5D%2C%22types%22%3A%5B%22VerifiableCredential%22%2C%22OpenBadgeCredential%22%5D%7D%7D%5D%2C%22grants%22%3A%7B%22authorization_code%22%3A%7B%22issuer_state%22%3A%2245528108-4e07-47f4-8ee4-f8c5c854691f%22%7D%2C%22urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Apre-authorized_code%22%3A%7B%22pre-authorized_code%22%3A%22eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiI0NTUyODEwOC00ZTA3LTQ3ZjQtOGVlNC1mOGM1Yzg1NDY5MWYiLCJpc3MiOiJodHRwczovL2lzc3Vlci5wb3J0YWwud2FsdC5pZCIsImF1ZCI6IlRPS0VOIn0.qam_HsVH7qQPTTb6z88Qnpu8mggxMSTVcAUJdcuAVRxirH1Xk9B0z-aUxrH5EbtS1N1wvZ-rHDkzaVtZSpAHBQ%22%2C%22user_pin_required%22%3Afalse%7D%7D%7D',
};

describe('Testing oid4vci with regular machine, should ', (): void => {
  test('result in an issued vc within the wallet?????', async (): Promise<void> => {
    // TODO name
    const oid4vciInstance: OID4VCIMachineInterpreter = OID4VCIMachine.newInstance({
      requireCustomNavigationHook: false,
      requestData: mockedRequestData,
    });
    const component: JSX.Element = createComponent(oid4vciInstance);
    render(component);
    oid4vciInstance.start();
    const message: ReactTestInstance = await screen.findByText(/Getting information.../); // TODO translation
    // const items: Array<ReactTestInstance> = await screen.findAllByText(/Allows you/);
    const nextButtonText: ReactTestInstance = await screen.findByText(/Next|Go|Accept/);

    while (oid4vciInstance.getSnapshot().value === OID4VCIMachineStates.initiating) {
      console.log('still initiating');
    }

    // TODO add other states

    // console.log(`OID4VCI 111111`)
    // Loading screen
    expect(oid4vciInstance.getSnapshot().value).toBe(OID4VCIMachineStates.addingContact);
    // console.log(`OID4VCI 222222`)
    expect(message).toBeOnTheScreen();

    console.log('YAAAAAAAAAY');

    // expect(items.length).toBe(1);
    //
    // // We click 3 times next to go the next screen
    // await act(() => fireEvent.press(nextButtonText));
    // await act(() => fireEvent.press(nextButtonText));
    // await act(() => fireEvent.press(nextButtonText));
    //
    // // TOS screen
    // expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.acceptAgreement);
    // expect(header).toBeOnTheScreen();
    // await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the terms/)));
    // await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the privacy/)));
    // await act(() => fireEvent.press(nextButtonText));
    //
    // // Personal Details screen
    // expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
    // await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/First name/), 'Bob'));
    // await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Last name/), 'the Builder'));
    // await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@en.of'));
    // await act(() => fireEvent.press(nextButtonText));
    //
    // // Pin entry and verification
    // expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPin);
    // // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
    // await act(async (): Promise<void> =>
    //   fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '123456'}}),
    // );
    // expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPin);
    // await act(async (): Promise<void> =>
    //   fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '123456'}}),
    // );
    //
    // // Verification screen
    // expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPersonalDetails);
    // await act(() => fireEvent.press(nextButtonText));
    //
    // // This is where the walletSetup state runs it's setup tasks
    // await new Promise(res => setTimeout(res, 2000));
    //
    // // Done
    // expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.finishOnboarding);
  });
});

//describe('Testing onboarding ui without services, should ', (): void => {
// test('result in onboarding happy flow to finish', async (): Promise<void> => {
//   const onboardingInstance: OnboardingInterpretType = OnboardingMachine.getInstance({
//     services: {
//       [OnboardingStates.setupWallet]: () => Promise.resolve(console.log('done!')),
//     },
//     requireCustomNavigationHook: false,
//   });
//   const component: JSX.Element = createComponent(onboardingInstance);
//   render(component);
//
//   const header: ReactTestInstance = await screen.findByText(/Welcome/);
//   const items: Array<ReactTestInstance> = await screen.findAllByText(/Allows you/);
//   const nextButtonText: ReactTestInstance = await screen.findByText(/Next|Go|Accept/);
//
//   // Welcome screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.showIntro);
//   expect(header).toBeOnTheScreen();
//   expect(items.length).toBe(1);
//
//   // We click 3 times next to go the next screen
//   await act(() => fireEvent.press(nextButtonText));
//   await act(() => fireEvent.press(nextButtonText));
//   await act(() => fireEvent.press(nextButtonText));
//
//   // TOS screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.acceptAgreement);
//   expect(header).toBeOnTheScreen();
//   await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the terms/)));
//   await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the privacy/)));
//   await act(() => fireEvent.press(nextButtonText));
//
//   // Personal Details screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/First name/), 'Bob'));
//   await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Last name/), 'the Builder'));
//   await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@en.of'));
//   await act(() => fireEvent.press(nextButtonText));
//
//   // Pin entry and verification
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPin);
//   // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
//   await act(async (): Promise<void> =>
//     fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '123456'}}),
//   );
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPin);
//   await act(async (): Promise<void> =>
//     fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '123456'}}),
//   );
//
//   // Verification screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPersonalDetails);
//   await act(() => fireEvent.press(nextButtonText));
//
//   // This is where the walletSetup state runs it's setup tasks
//   await new Promise(res => setTimeout(res, 50));
//
//   // Done
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.finishOnboarding);
// });

// test('have working guards and finish onboarding', async (): Promise<void> => {
//   const onboardingInstance: OnboardingInterpretType = OnboardingMachine.getInstance({
//     services: {
//       [OnboardingStates.setupWallet]: () => Promise.resolve(console.log('done!')),
//     },
//     requireCustomNavigationHook: false,
//   });
//   const component: JSX.Element = createComponent(onboardingInstance);
//   render(component);
//
//   const header: ReactTestInstance = await screen.findByText(/Welcome/);
//   const items: Array<ReactTestInstance> = await screen.findAllByText(/Allows you/);
//   const nextButtonText: ReactTestInstance = await screen.findByText(/Next|Go|Accept/);
//
//   // Welcome screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.showIntro);
//   expect(header).toBeOnTheScreen();
//   expect(items.length).toBe(1);
//
//   // We click 3 times next to go the next screen
//   await act(() => fireEvent.press(nextButtonText));
//   await mockPressBack(); // Back at start screen
//   await act(() => fireEvent.press(nextButtonText));
//   await act(() => fireEvent.press(nextButtonText));
//   await mockPressBack(); // In step 1
//   await act(() => fireEvent.press(nextButtonText));
//   await act(() => fireEvent.press(nextButtonText));
//
//   // TOS screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.acceptAgreement);
//   expect(header).toBeOnTheScreen();
//
//   await mockPressBack({onboardingInstance}); // Welcome screen step 3
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.showIntro);
//
//   await act(() => fireEvent.press(nextButtonText));
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.acceptAgreement);
//
//   await act(() => fireEvent.press(nextButtonText)); // Does nothing as accept checkboxes are not pressed yet
//   await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the terms/)));
//   await act(() => fireEvent.press(nextButtonText)); // Does nothing as accept checkboxes are not pressed yet
//   await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the privacy/)));
//   await act(() => fireEvent.press(nextButtonText));
//
//   // Personal Details screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await mockPressBack({onboardingInstance}); // Back to TOS
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.acceptAgreement);
//   await mockPressBack({onboardingInstance}); // Back to Welcome
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.showIntro);
//
//   // TOS with checkboxes checked
//   await act(() => fireEvent.press(nextButtonText));
//   await act(() => fireEvent.press(nextButtonText));
//
//   // Personal Details screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await act(() => fireEvent.press(nextButtonText));
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/First name/), 'Bob'));
//   await act(() => fireEvent.press(nextButtonText));
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Last name/), 'the Builder'));
//   await act(() => fireEvent.press(nextButtonText));
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou'));
//   await act(() => fireEvent.press(nextButtonText));
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@'));
//   await act(() => fireEvent.press(nextButtonText));
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@en.of'));
//   await act(() => fireEvent.press(nextButtonText));
//
//   // Pin entry and verification
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPin);
//   // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
//   await act(async (): Promise<void> =>
//     fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '654321'}}),
//   );
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPin);
//   await act(async (): Promise<void> =>
//     fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '000000'}}),
//   );
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPin);
//   await act(async (): Promise<void> =>
//     fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '654321'}}),
//   );
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPersonalDetails);
//
//   await mockPressBack({onboardingInstance}); // Back to PinEntry skipping verify!
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPin);
//
//   await mockPressBack({onboardingInstance}); // Back to PinEntry skipping verify!
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPersonalDetails);
//   await act(() => fireEvent.press(nextButtonText));
//
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.enterPin);
//   // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
//   await act(async (): Promise<void> =>
//     fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '123456'}}),
//   );
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPin);
//   await act(async (): Promise<void> =>
//     fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '123456'}}),
//   );
//
//   // Verification screen
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.verifyPersonalDetails);
//
//   const context: IOnboardingMachineContext = onboardingInstance.getSnapshot().context;
//   expect(context).toMatchObject({
//     credentialData: {
//       credential: {
//         '@context': [
//           'https://www.w3.org/2018/credentials/v1',
//           'https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld',
//         ],
//         credentialSubject: {},
//         issuanceDate: {},
//         type: ['VerifiableCredential', 'SphereonWalletIdentityCredential'],
//       },
//       didMethod: 'key',
//       proofFormat: 'jwt',
//     },
//     personalData: {
//       emailAddress: 'nou@en.of',
//       firstName: 'Bob',
//       lastName: 'the Builder',
//     },
//     pinCode: '123456',
//     privacyPolicyAccepted: true,
//     termsConditionsAccepted: true,
//   });
//
//   await act(() => fireEvent.press(nextButtonText));
//
//   // This is where the walletSetup state runs it's setup tasks
//   await new Promise(res => setTimeout(res, 50));
//
//   // Done
//   expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.finishOnboarding);
//
//   const finalContext: IOnboardingMachineContext = onboardingInstance.getSnapshot().context;
//   expect(finalContext).toEqual({
//     pinCode: '',
//     privacyPolicyAccepted: false,
//     termsConditionsAccepted: false,
//   });
// });
//});
