import Debug, {Debugger} from 'debug';
import React, {Context, createContext} from 'react';
import {APP_ID} from '../../@config/constants';
import {OnboardingMachine} from '../../machines/onboardingMachine';
import {ScreenRoutesEnum} from '../../types';
import {
  OnboardingContext as OnboardingContextType,
  OnboardingMachineContext,
  OnboardingMachineEvents,
  OnboardingMachineInterpreter,
  OnboardingMachineNavigationArgs,
  OnboardingMachineState,
  OnboardingMachineStateType,
  OnboardingProviderProps,
} from '../../types/machines/onboarding';
import RootNavigation from './../rootNavigation';

const debug: Debugger = Debug(`${APP_ID}:onboardingStateNavigation`);

export const OnboardingContext: Context<OnboardingContextType> = createContext({} as OnboardingContextType);

const navigateWelcome = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, context} = args;
  navigation.navigate(ScreenRoutesEnum.WELCOME, {context, onNext});
};

const navigateShowProgress = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, context} = args;
  navigation.navigate(ScreenRoutesEnum.SHOW_PROGRESS, {context, onNext});
};

const navigateEnterName = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context, onboardingMachine} = args;
  const onChangeText = (name: string) => {
    onboardingMachine.send({type: OnboardingMachineEvents.SET_NAME, data: name});
  };
  navigation.navigate(ScreenRoutesEnum.ENTER_NAME, {context, onNext, onBack, onChangeText});
};

const navigateEnterEmailAddress = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.ENTER_EMAIL_ADDRESS, {context, onNext, onBack});
};

const navigateEnterCountry = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.ENTER_COUNTRY, {context, onNext, onBack});
};

const navigateEnterPinCode = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.ENTER_PIN_CODE, {context, onNext, onBack});
};

const navigateVerifyPinCode = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.VERIFY_PIN_CODE, {context, onNext, onBack});
};

const navigateEnableBiometrics = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.ENABLE_BIOMETRICS, {context, onNext, onBack});
};

const navigateAcceptTermsAndPrivacy = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.ACCEPT_TERMS, {context, onNext, onBack});
};

const navigateReadTermsAndPrivacy = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.READ_TERMS, {context, onNext, onBack});
};

export const onboardingStateNavigationListener = async (
  onboardingMachine: OnboardingMachineInterpreter,
  state: OnboardingMachineState,
  navigation?: any,
): Promise<void> => {
  if (state._event.type === 'internal') {
    // Make sure we do not navigate when triggered by an internal event. We need to stay on current screen
    // Make sure we do not navigate when state has not changed
    return;
  }
  const context: OnboardingMachineContext = onboardingMachine.getSnapshot().context;
  const onBack = () => onboardingMachine.send(OnboardingMachineEvents.PREVIOUS);
  const onNext = () => onboardingMachine.send(OnboardingMachineEvents.NEXT);
  const nav = navigation ?? RootNavigation;
  if (nav === undefined || !nav.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }
  if (state.matches(OnboardingMachineStateType.showIntro)) {
    return navigateWelcome({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.showProgress)) {
    return navigateShowProgress({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.enterName)) {
    return navigateEnterName({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.enterEmailAddress)) {
    return navigateEnterEmailAddress({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.enterCountry)) {
    return navigateEnterCountry({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.enterPinCode)) {
    return navigateEnterPinCode({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.verifyPinCode)) {
    return navigateVerifyPinCode({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.enableBiometrics)) {
    return navigateEnableBiometrics({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.acceptTermsAndPrivacy)) {
    return navigateAcceptTermsAndPrivacy({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStateType.readTermsAndPrivacy)) {
    return navigateReadTermsAndPrivacy({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else {
    return Promise.reject(Error(`Navigation for ${JSON.stringify(state)} is not implemented!`)); // Should not happen, so we throw an error
  }
};

export const OnboardingProvider = (props: OnboardingProviderProps): JSX.Element => {
  const {children, customOnboardingInstance} = props;

  return (
    <OnboardingContext.Provider value={{onboardingInstance: customOnboardingInstance ?? OnboardingMachine.getInstance({requireExisting: true})}}>
      {children}
    </OnboardingContext.Provider>
  );
};
