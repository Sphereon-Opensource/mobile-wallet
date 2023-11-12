import Debug from 'debug';
import React, {ReactNode} from 'react';
import {State} from 'xstate';
import {APP_ID} from '../@config/constants';
import {translate} from '../localization/Localization';
import {OnboardingContext, OnboardingMachine} from '../machines/onboardingMachine';
import store from '../store';
import {ScreenRoutesEnum} from '../types';
import {
  IOnboardingMachineContext,
  IOnboardingPersonalData,
  OnboardingEvents,
  OnboardingEventTypes,
  OnboardingInterpretType,
  OnboardingStates,
} from '../types/onboarding';
import {LOGIN_SUCCESS} from '../types/store/user.action.types';
import RootNavigation from './rootNavigation';

const debug: Debug.Debugger = Debug(`${APP_ID}:storageService`);
export const onboardingStateNavigationListener = (
  onboardingMachine: OnboardingInterpretType,
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
  navigation?: any,
) => {
  const onBack = () => onboardingMachine.send(OnboardingEvents.PREVIOUS);
  const onNext = () => onboardingMachine.send(OnboardingEvents.NEXT);
  const context = onboardingMachine.getSnapshot().context;

  const nav = navigation ?? RootNavigation;
  if (nav === undefined || !nav.isReady()) {
    debug(`navigation not ready yet`);
    return;
  }
  if (state.matches(OnboardingStates.welcomeIntro)) {
    nav.navigate(ScreenRoutesEnum.WELCOME, {context, onNext});
  } else if (state.matches(OnboardingStates.tosAgreement)) {
    nav.navigate(ScreenRoutesEnum.TERMS_OF_SERVICE, {
      headerTitle: translate('terms_of_service_title'),
      context,
      onBack,
      onNext,
      onDecline: () => onboardingMachine.send(OnboardingEvents.DECLINE),
      onAcceptTerms: (accept: boolean) =>
        onboardingMachine.send({
          type: OnboardingEvents.SET_TOC,
          data: accept,
        }),
      onAcceptPrivacy: (accept: boolean) =>
        onboardingMachine.send({
          type: OnboardingEvents.SET_POLICY,
          data: accept,
        }),
      isDisabled: () => onboardingMachine.getSnapshot()?.can(OnboardingEvents.NEXT) !== true,
    });
  } else if (state.matches(OnboardingStates.personalDetailsEntry)) {
    nav.navigate(ScreenRoutesEnum.PERSONAL_DATA, {
      context,
      isDisabled: () => onboardingMachine.getSnapshot()?.can(OnboardingEvents.NEXT) !== true,
      onPersonalData: (personalData: IOnboardingPersonalData) =>
        onboardingMachine.send({
          type: OnboardingEvents.SET_PERSONAL_DATA,
          data: personalData,
        }),
      onBack,
      onNext: (personalData: IOnboardingPersonalData) => {
        onboardingMachine.send([
          {
            type: OnboardingEvents.SET_PERSONAL_DATA,
            data: personalData,
          },
          OnboardingEvents.NEXT,
        ]);
      },
    });
  } else if (state.matches(OnboardingStates.pinEntry)) {
    nav.navigate(ScreenRoutesEnum.PIN_CODE_SET, {
      headerSubTitle: translate('pin_code_choose_pin_code_subtitle'),
      context,
      onBack,
      onNext: (pinCode: string) => {
        onboardingMachine.send([
          {
            type: OnboardingEvents.SET_PIN,
            data: pinCode,
          },
          OnboardingEvents.NEXT,
        ]);
      },
    });
  } else if (state.matches(OnboardingStates.pinVerify)) {
    nav.navigate(ScreenRoutesEnum.PIN_CODE_VERIFY, {
      headerSubTitle: translate('pin_code_confirm_pin_code_subtitle'),
      context,
      onBack,
      onNext: (pinCode: string) => {
        onboardingMachine.send({
          type: OnboardingEvents.NEXT,
          data: pinCode,
        });
      },
    });
  } else if (state.matches(OnboardingStates.personalDetailsVerify)) {
    nav.navigate(ScreenRoutesEnum.ONBOARDING_SUMMARY, {context, onBack, onNext});
  } else if (state.matches(OnboardingStates.walletSetup)) {
    nav.navigate(ScreenRoutesEnum.LOADING, {
      message: translate('action_onboarding_setup_message'),
      context,
    });
  } else if (state.matches(OnboardingStates.onboardingDone)) {
    // Cleans up the machine, triggering the main navigator
    OnboardingMachine.stopInstance();
    store.dispatch<any>({type: LOGIN_SUCCESS, payload: store.getState().user.activeUser}); // Yuck, but we need a rerender
  } else {
    throw Error(`Navigation for ${JSON.stringify(state)} is not implemented!`); // Should not happen, so we throw an error
  }
};

export const OnboardingProvider = (props: {children?: ReactNode | undefined; customOnboardingInstance?: OnboardingInterpretType}): JSX.Element => {
  return (
    <OnboardingContext.Provider
      value={{onboardingInstance: props.customOnboardingInstance ?? OnboardingMachine.getInstance({requireExisting: true})}}>
      {props.children}
    </OnboardingContext.Provider>
  );
};
