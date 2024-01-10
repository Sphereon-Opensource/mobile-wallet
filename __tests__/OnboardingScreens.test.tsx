import {NavigationContainer} from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {Provider} from 'react-redux';
import {act, ReactTestInstance} from 'react-test-renderer';
import {Interpreter} from 'xstate';
import {OnboardingProvider} from '../src/navigation/machines/onboardingStateNavigation';
import {OnboardingMachine} from '../src/machines/onboardingMachine';
import {OnboardingStack} from '../src/navigation/navigation';
import {navigationRef} from '../src/navigation/rootNavigation';
import OnTouchProvider from '../src/providers/touch/OnTouchProvider';
import store from '../src/store';
import {
  OnboardingMachineContext,
  OnboardingMachineEvents,
  OnboardingMachineEventTypes,
  OnboardingMachineInterpreter,
  OnboardingMachineStates,
} from '../src/types/machines/onboarding';

import BackHandler from 'react-native/Libraries/Utilities/__mocks__/BackHandler';

export const mockPressBack = async (opts?: {onboardingInstance: any}): Promise<void> => {
  typeof opts?.onboardingInstance === 'object'
    ? opts.onboardingInstance.send(OnboardingMachineEvents.PREVIOUS)
    : await act(() => BackHandler.mockPressBack());
};

jest.setTimeout(60 * 1000); // 60 seconds
function createComponent(
  onboardingInstance: Interpreter<OnboardingMachineContext, any, OnboardingMachineEventTypes, {value: any; context: OnboardingMachineContext}, any>,
): JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer
        onReady={(): void => {
          onboardingInstance.start();
          console.log('Navigation is ready');
        }}
        ref={navigationRef}>
        <OnTouchProvider>
          <OnboardingProvider customOnboardingInstance={OnboardingMachine.getInstance({requireExisting: true})}>
            <OnboardingStack />
          </OnboardingProvider>
        </OnTouchProvider>
      </NavigationContainer>
    </Provider>
  );
}

describe('Testing onboarding with regular machine, should ', (): void => {
  test('result in fully onboarded user with credential', async (): Promise<void> => {
    const onboardingInstance: OnboardingMachineInterpreter = OnboardingMachine.getInstance({
      requireCustomNavigationHook: false,
    });
    const component: JSX.Element = createComponent(onboardingInstance);
    render(component);
    // rendered.debug();

    const header: ReactTestInstance = await screen.findByText(/Welcome/);
    const items: Array<ReactTestInstance> = await screen.findAllByText(/Allows you/);
    const nextButtonText: ReactTestInstance = await screen.findByText(/Next|Go|Accept/);

    // Welcome screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.showIntro);
    expect(header).toBeOnTheScreen();
    expect(items.length).toBe(1);

    // We click 3 times next to go the next screen
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));

    // TOS screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.acceptAgreement);
    expect(header).toBeOnTheScreen();
    await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the terms/)));
    await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the privacy/)));
    await act(() => fireEvent.press(nextButtonText));

    // Personal Details screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/First name/), 'Bob'));
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Last name/), 'the Builder'));
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@en.of'));
    await act(() => fireEvent.press(nextButtonText));

    // Pin entry and verification
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPin);
    // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '123456'}}),
    );
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPin);
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '123456'}}),
    );

    // Verification screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPersonalDetails);
    await act(() => fireEvent.press(nextButtonText));

    // This is where the walletSetup state runs it's setup tasks
    await new Promise(res => setTimeout(res, 2000));

    // Done
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.finishOnboarding);
  });
});

describe('Testing onboarding ui without services, should ', (): void => {
  test('result in onboarding happy flow to finish', async (): Promise<void> => {
    const onboardingInstance: OnboardingMachineInterpreter = OnboardingMachine.getInstance({
      services: {
        [OnboardingMachineStates.setupWallet]: () => Promise.resolve(console.log('done!')),
      },
      requireCustomNavigationHook: false,
    });
    const component: JSX.Element = createComponent(onboardingInstance);
    render(component);

    const header: ReactTestInstance = await screen.findByText(/Welcome/);
    const items: Array<ReactTestInstance> = await screen.findAllByText(/Allows you/);
    const nextButtonText: ReactTestInstance = await screen.findByText(/Next|Go|Accept/);

    // Welcome screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.showIntro);
    expect(header).toBeOnTheScreen();
    expect(items.length).toBe(1);

    // We click 3 times next to go the next screen
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));

    // TOS screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.acceptAgreement);
    expect(header).toBeOnTheScreen();
    await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the terms/)));
    await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the privacy/)));
    await act(() => fireEvent.press(nextButtonText));

    // Personal Details screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/First name/), 'Bob'));
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Last name/), 'the Builder'));
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@en.of'));
    await act(() => fireEvent.press(nextButtonText));

    // Pin entry and verification
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPin);
    // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '123456'}}),
    );
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPin);
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '123456'}}),
    );

    // Verification screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPersonalDetails);
    await act(() => fireEvent.press(nextButtonText));

    // This is where the walletSetup state runs it's setup tasks
    await new Promise(res => setTimeout(res, 50));

    // Done
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.finishOnboarding);
  });

  test('have working guards and finish onboarding', async (): Promise<void> => {
    const onboardingInstance: OnboardingMachineInterpreter = OnboardingMachine.getInstance({
      services: {
        [OnboardingMachineStates.setupWallet]: () => Promise.resolve(console.log('done!')),
      },
      requireCustomNavigationHook: false,
    });
    const component: JSX.Element = createComponent(onboardingInstance);
    render(component);

    const header: ReactTestInstance = await screen.findByText(/Welcome/);
    const items: Array<ReactTestInstance> = await screen.findAllByText(/Allows you/);
    const nextButtonText: ReactTestInstance = await screen.findByText(/Next|Go|Accept/);

    // Welcome screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.showIntro);
    expect(header).toBeOnTheScreen();
    expect(items.length).toBe(1);

    // We click 3 times next to go the next screen
    await act(() => fireEvent.press(nextButtonText));
    await mockPressBack(); // Back at start screen
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));
    await mockPressBack(); // In step 1
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));

    // TOS screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.acceptAgreement);
    expect(header).toBeOnTheScreen();

    await mockPressBack({onboardingInstance}); // Welcome screen step 3
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.showIntro);

    await act(() => fireEvent.press(nextButtonText));
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.acceptAgreement);

    await act(() => fireEvent.press(nextButtonText)); // Does nothing as accept checkboxes are not pressed yet
    await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the terms/)));
    await act(() => fireEvent.press(nextButtonText)); // Does nothing as accept checkboxes are not pressed yet
    await act(async (): Promise<void> => fireEvent.press(await screen.findByText(/accept the privacy/)));
    await act(() => fireEvent.press(nextButtonText));

    // Personal Details screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await mockPressBack({onboardingInstance}); // Back to TOS
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.acceptAgreement);
    await mockPressBack({onboardingInstance}); // Back to Welcome
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.showIntro);

    // TOS with checkboxes checked
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));

    // Personal Details screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(() => fireEvent.press(nextButtonText));
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/First name/), 'Bob'));
    await act(() => fireEvent.press(nextButtonText));
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Last name/), 'the Builder'));
    await act(() => fireEvent.press(nextButtonText));
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou'));
    await act(() => fireEvent.press(nextButtonText));
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@'));
    await act(() => fireEvent.press(nextButtonText));
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(async (): Promise<void> => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@en.of'));
    await act(() => fireEvent.press(nextButtonText));

    // Pin entry and verification
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPin);
    // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '654321'}}),
    );
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPin);
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '000000'}}),
    );
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPin);
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '654321'}}),
    );
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPersonalDetails);

    await mockPressBack({onboardingInstance}); // Back to PinEntry skipping verify!
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPin);

    await mockPressBack({onboardingInstance}); // Back to PinEntry skipping verify!
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPersonalDetails);
    await act(() => fireEvent.press(nextButtonText));

    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.enterPin);
    // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '123456'}}),
    );
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPin);
    await act(
      async (): Promise<void> =>
        fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '123456'}}),
    );

    // Verification screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.verifyPersonalDetails);

    const context: OnboardingMachineContext = onboardingInstance.getSnapshot().context;
    expect(context).toMatchObject({
      credentialData: {
        credential: {
          '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld',
          ],
          credentialSubject: {},
          issuanceDate: {},
          type: ['VerifiableCredential', 'SphereonWalletIdentityCredential'],
        },
        didMethod: 'key',
        proofFormat: 'jwt',
      },
      personalData: {
        emailAddress: 'nou@en.of',
        firstName: 'Bob',
        lastName: 'the Builder',
      },
      pinCode: '123456',
      privacyPolicyAccepted: true,
      termsConditionsAccepted: true,
    });

    await act(() => fireEvent.press(nextButtonText));

    // This is where the walletSetup state runs it's setup tasks
    await new Promise(res => setTimeout(res, 50));

    // Done
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingMachineStates.finishOnboarding);

    const finalContext: OnboardingMachineContext = onboardingInstance.getSnapshot().context;
    expect(finalContext).toEqual({
      pinCode: '',
      privacyPolicyAccepted: false,
      termsConditionsAccepted: false,
    });
  });
});
