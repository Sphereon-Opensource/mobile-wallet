import {
  IOnboardingMachineContext,
  IOnboardingPersonalData,
  OnboardingEvents,
  OnboardingEventTypes,
  OnboardingInterpretType,
  OnboardingStates,
  ScreenRoutesEnum,
} from '../types';
import {LogBox} from 'react-native';
import {State} from 'xstate';
import {translate} from '../localization/Localization';
import RootNavigation from './rootNavigation';

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
    console.log(`navigation not ready yet`);
    return;
  }
  LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
  if (state.matches(OnboardingStates.welcomeIntro)) {
    console.log(`welcome!`);
    nav.navigate(
      ScreenRoutesEnum.WELCOME,
      /*{
        index: 0,
        routes: [{name: ScreenRoutesEnum.WELCOME}],

      },*/
      {context, onNext},
    );
    // navigation.navigate(ScreenRoutesEnum.WELCOME, {step: 1});
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
      onNext,
    });
  } else if (state.matches(OnboardingStates.personalDetailsVerify)) {
    nav.navigate(ScreenRoutesEnum.ONBOARDING_SUMMARY, {context, onBack, onNext});
  } else if (state.matches(OnboardingStates.walletSetup)) {
    nav.navigate(ScreenRoutesEnum.LOADING, {
      message: translate('action_onboarding_setup_message'),
      context,
    });
  } else {
    console.log(`TODO navigation for ${JSON.stringify(state)}`);
  }
};
