import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {Provider} from 'react-redux';
import {act} from 'react-test-renderer';
import {OnboardingStack} from '../src/navigation/navigation';
import {OnboardingStates} from '../src/types/onboarding';
import {OnboardingMachine, OnboardingProvider} from '../src/machines/onboardingMachine';

import {navigationRef} from '../src/navigation/rootNavigation';
import OnTouchProvider from '../src/providers/touch/OnTouchProvider';
import store from '../src/store';
import {StackParamList, SwitchRoutesEnum} from '../src/types';

jest.setTimeout(60 * 1000); // 60 seconds
describe('Testing onboarding, should ', () => {
  test('result in fully onboarded user with credential', async () => {
    const onboardingInstance = OnboardingMachine.getInstance({
      /*services: {
        [OnboardingStates.walletSetup]: () => {
          console.log('done!');
        },
      },*/
      requireCustomNavigationHook: false,
    });
    /*onboardingInstance.subscribe(
      (
        state: State<
          IOnboardingMachineContext,
          OnboardingEventTypes,
          any,
          {
            value: any;
            context: IOnboardingMachineContext;
          },
          any
        >,
      ) => onboardingNavigations(onboardingInstance, state),
    );
*/
    // const Stack = createNativeStackNavigator<StackParamList>();
    const component = (
      <Provider store={store}>
        <NavigationContainer
          onReady={() => {
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
    render(component);
    // rendered.debug();

    const header = await screen.findByText(/Welcome/);
    const items = await screen.findAllByText(/Allows you/);
    const nextButtonText = await screen.findByText(/Next|Go|Accept/);

    // Welcome screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.welcomeIntro);
    expect(header).toBeOnTheScreen();
    expect(items.length).toBe(1);

    // We click 3 times next to go the next screen
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));
    await act(() => fireEvent.press(nextButtonText));

    // TOS screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.tosAgreement);
    expect(header).toBeOnTheScreen();
    await act(async () => fireEvent.press(await screen.findByText(/accept the terms/)));
    await act(async () => fireEvent.press(await screen.findByText(/accept the privacy/)));
    await act(() => fireEvent.press(nextButtonText));

    // Personal Details screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.personalDetailsEntry);
    await act(async () => fireEvent.changeText(await screen.findByText(/First name/), 'Bob'));
    await act(async () => fireEvent.changeText(await screen.findByText(/Last name/), 'the Builder'));
    await act(async () => fireEvent.changeText(await screen.findByText(/Email address/), 'nou@en.of'));
    await act(() => fireEvent.press(nextButtonText));

    // Pin entry and verification
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.pinEntry);
    // We need to find the hidden input text, as we are overlay an SVG. We also need to fire an event that would come from the keyboard
    await act(async () =>
      fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[0], 'submitEditing', {nativeEvent: {text: '123456'}}),
    );
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.pinVerify);
    await act(async () =>
      fireEvent((await screen.findAllByLabelText('Pin code', {hidden: true}))[1], 'submitEditing', {nativeEvent: {text: '123456'}}),
    );

    // Verification screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.personalDetailsVerify);
    await act(() => fireEvent.press(nextButtonText));

    // This is where the walletSetup state runs it's setup tasks
    await new Promise(res => setTimeout(res, 2000));

    // Done
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.onboardingDone);
  });
});
