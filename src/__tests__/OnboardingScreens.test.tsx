import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {act} from 'react-test-renderer';
import {OnboardingMachine} from '../machines/onboardingMachine';
import {OnboardingStackScreenWithContext} from '../navigation/navigation';
import {navigationRef} from '../navigation/rootNavigation';
import OnTouchProvider from '../providers/touch/OnTouchProvider';
import store from '../store';
import {OnboardingStates, StackParamList, SwitchRoutesEnum} from '../types';

jest.setTimeout(1000 * 1000); // 60 seconds

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
    const Stack = createNativeStackNavigator<StackParamList>();
    const component = (
      <Provider store={store}>
        <NavigationContainer
          onReady={() => {
            onboardingInstance.start();
            console.log('Navigation is ready');
          }}
          ref={navigationRef}>
          <OnTouchProvider>
            <Stack.Navigator
              screenOptions={{
                animation: 'none',
                headerShown: false,
              }}>
              <Stack.Screen name={SwitchRoutesEnum.ONBOARDING} component={OnboardingStackScreenWithContext} />
            </Stack.Navigator>
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
    await act(async () => fireEvent(await screen.findByLabelText('Pin code', {hidden: true}), 'submitEditing', {nativeEvent: {text: '123456'}}));
    await act(async () => fireEvent(await screen.findByLabelText('Pin code', {hidden: true}), 'submitEditing', {nativeEvent: {text: '123456'}}));

    // Verification screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.personalDetailsVerify);
    await act(() => fireEvent.press(nextButtonText));

    // This is where the walletSetup state runs it's setup tasks
    await new Promise(res => setTimeout(res, 2000));

    // Done
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.onboardingDone);
  });
});
