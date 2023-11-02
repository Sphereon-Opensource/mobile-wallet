import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {act} from 'react-test-renderer';
import {State} from 'xstate';
import {OnboardingStackScreenWithContext} from '../navigation/navigation';
import {navigationRef} from '../navigation/rootNavigation';
import OnTouchProvider from '../providers/touch/OnTouchProvider';
import {
  IOnboardingMachineContext,
  OnboardingEventTypes,
  OnboardingMachine,
  onboardingNavigations,
  OnboardingStates,
} from '../services/onboardingMachine';
import store from '../store';
import {StackParamList, SwitchRoutesEnum} from '../types';

jest.setTimeout(1000 * 1000); // 60 seconds

describe('Testing onboarding, should ', () => {
  test('show Welcome screen', async () => {
    // await act(async () => {
    const onboardingInstance = OnboardingMachine.getInstance({services: {}, noDefaultNavigationHook: true});
    onboardingInstance.subscribe(
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

    const Stack = createNativeStackNavigator<StackParamList>();
    const Tab = createBottomTabNavigator();
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
    const rendered = render(component);
    // rendered.debug();

    const header = await screen.findByText(/Welcome/);
    const items = await screen.findAllByText(/Allows you/);
    const nextButtonText = await screen.findByText(/Next|Go|Accept/);

    // Welcome screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.welcomeIntro);
    expect(header).toBeOnTheScreen();
    expect(items.length).toBe(1);

    // We click 3 times next to go the next screen
    act(() => fireEvent.press(nextButtonText));
    act(() => fireEvent.press(nextButtonText));
    act(() => fireEvent.press(nextButtonText));

    // TOS screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.tosAgreement);
    expect(header).toBeOnTheScreen();
    await act(async () => fireEvent.press(await screen.findByText(/accept the terms/)));
    await act(async () => fireEvent.press(await screen.findByText(/accept the privacy/)));
    act(() => fireEvent.press(nextButtonText));

    // Personal Details screen
    expect(onboardingInstance.getSnapshot().value).toBe(OnboardingStates.personalDetailsEntry);

    // rendered.debug();
  });
});
