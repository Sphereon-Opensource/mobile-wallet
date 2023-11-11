import Debug from 'debug';
import {State} from 'xstate';
import {APP_ID} from '../@config/constants';
import {translate} from '../localization/Localization';
import {ScreenRoutesEnum} from '../types';
import {
  IOnboardingMachineContext,
  IOnboardingPersonalData,
  OnboardingEvents,
  OnboardingEventTypes,
  OnboardingInterpretType,
  OnboardingStates,
} from '../types/onboarding';
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
  } else {
    debug(`TODO navigation for ${JSON.stringify(state)}`);
  }
};
