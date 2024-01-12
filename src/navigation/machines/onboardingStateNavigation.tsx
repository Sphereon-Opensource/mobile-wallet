import Debug, {Debugger} from 'debug';
import React, {Context, createContext} from 'react';
import {APP_ID} from '../../@config/constants';
import {translate} from '../../localization/Localization';
import {OnboardingMachine} from '../../machines/onboardingMachine';
import store from '../../store';
import {ScreenRoutesEnum} from '../../types';
import {
  OnboardingMachineContext,
  OnboardingPersonalData,
  OnboardingContext as OnboardingContextType,
  OnboardingMachineEvents,
  OnboardingMachineInterpreter,
  OnboardingMachineState,
  OnboardingMachineStates,
  OnboardingMachineNavigationArgs,
  OnboardingProviderProps,
} from '../../types/machines/onboarding';
import {LOGIN_SUCCESS} from '../../types/store/user.action.types';
import RootNavigation from './../rootNavigation';

const debug: Debugger = Debug(`${APP_ID}:onboardingStateNavigation`);

const OnboardingContext: Context<OnboardingContextType> = createContext({} as OnboardingContextType);

const navigateWelcome = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, context} = args;
  navigation.navigate(ScreenRoutesEnum.WELCOME, {context, onNext});
};

const navigateTermsOfService = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {onboardingMachine, navigation, onNext, onBack, context} = args;

  const isNextDisabled = (): boolean => {
    return onboardingMachine.getSnapshot()?.can(OnboardingMachineEvents.NEXT) !== true;
  };

  navigation.navigate(ScreenRoutesEnum.TERMS_OF_SERVICE, {
    headerTitle: translate('terms_of_service_title'),
    context,
    onBack,
    onNext,
    onDecline: () => onboardingMachine.send(OnboardingMachineEvents.DECLINE),
    onAcceptTerms: (accept: boolean) =>
      onboardingMachine.send({
        type: OnboardingMachineEvents.SET_TOC,
        data: accept,
      }),
    onAcceptPrivacy: (accept: boolean) =>
      onboardingMachine.send({
        type: OnboardingMachineEvents.SET_POLICY,
        data: accept,
      }),
    isDisabled: isNextDisabled,
  });
};

const navigatePersonalDetails = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {onboardingMachine, navigation, onBack, context} = args;

  const isNextDisabled = (): boolean => {
    return onboardingMachine.getSnapshot()?.can(OnboardingMachineEvents.NEXT) !== true;
  };

  navigation.navigate(ScreenRoutesEnum.PERSONAL_DATA, {
    context,
    isDisabled: isNextDisabled,
    onPersonalData: (personalData: OnboardingPersonalData) =>
      onboardingMachine.send({
        type: OnboardingMachineEvents.SET_PERSONAL_DATA,
        data: personalData,
      }),
    onBack,
    onNext: (personalData: OnboardingPersonalData): void => {
      onboardingMachine.send([
        {
          type: OnboardingMachineEvents.SET_PERSONAL_DATA,
          data: personalData,
        },
        OnboardingMachineEvents.NEXT,
      ]);
    },
  });
};

const navigateEnterPin = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {onboardingMachine, navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.PIN_CODE_SET, {
    headerSubTitle: translate('pin_code_choose_pin_code_subtitle'),
    context,
    onBack,
    onNext: (pinCode: string): void => {
      onboardingMachine.send([
        {
          type: OnboardingMachineEvents.SET_PIN,
          data: pinCode,
        },
        OnboardingMachineEvents.NEXT,
      ]);
    },
  });
};

const navigateVerifyPin = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {onboardingMachine, navigation, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.PIN_CODE_VERIFY, {
    headerSubTitle: translate('pin_code_confirm_pin_code_subtitle'),
    context,
    onBack,
    onNext: (pinCode: string): void => {
      onboardingMachine.send({
        type: OnboardingMachineEvents.NEXT,
        data: pinCode,
      });
    },
  });
};

const navigateVerifyPersonalDetails = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, onNext, onBack, context} = args;
  navigation.navigate(ScreenRoutesEnum.ONBOARDING_SUMMARY, {context, onBack, onNext});
};

const navigateSetupWallet = async (args: OnboardingMachineNavigationArgs): Promise<void> => {
  const {navigation, context} = args;
  navigation.navigate(ScreenRoutesEnum.LOADING, {
    message: translate('action_onboarding_setup_message'),
    context,
  });
};

const navigateDone = async (): Promise<void> => {
  // Cleans up the machine, triggering the main navigator
  OnboardingMachine.stopInstance();
  // Yuck, but we need a rerender. The retrieval of contacts etc is already done in the setupWallet service
  store.dispatch<any>({type: LOGIN_SUCCESS});
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

  if (state.matches(OnboardingMachineStates.showIntro)) {
    return navigateWelcome({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStates.acceptAgreement)) {
    return navigateTermsOfService({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStates.enterPersonalDetails)) {
    return navigatePersonalDetails({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStates.enterPin)) {
    return navigateEnterPin({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStates.verifyPin)) {
    return navigateVerifyPin({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStates.verifyPersonalDetails)) {
    return navigateVerifyPersonalDetails({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStates.setupWallet)) {
    return navigateSetupWallet({onboardingMachine, state, navigation: nav, onNext, onBack, context});
  } else if (state.matches(OnboardingMachineStates.finishOnboarding)) {
    return navigateDone();
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
