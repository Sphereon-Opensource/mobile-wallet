import {useInterpret} from '@xstate/react';
import React, {createContext, ReactNode} from 'react';
import {LogBox} from 'react-native';
import {ActorRefFrom, assign, createMachine, interpret, Interpreter, State, TypegenDisabled} from 'xstate';
import {translate} from '../localization/Localization';
import RootNavigation, {navigationRef} from '../navigation/rootNavigation';
import {finalizeOnboarding} from '../store/actions/onboarding.actions';
import {ScreenRoutesEnum} from '../types';
import {ISetPersonalDataActionArgs} from '../types/store/onboarding.types';

export interface IOnboardingMachineContext {
  termsConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  pinCode: string;
  personalData: IOnboardingPersonalData;
}

export interface IOnboardingPersonalData {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

export enum OnboardingStates {
  welcomeIntro = 'welcomeIntro',
  tosAgreement = 'tosAgreement',
  personalDetailsEntry = 'personalDetailsEntry',
  personalDetailsVerify = 'personalDetailsVerify',
  onboardingDeclined = 'onboardingDeclined',
  onboardingDone = 'onboardingDone',
  pinEntry = 'pinEntry',
  pinVerify = 'pinVerify',
  walletSetup = 'walletSetup',
}

export enum OnboardingEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  DECLINE = 'DECLINE',
  SET_TOC = 'SET_TOC',
  SET_POLICY = 'SET_POLICY',
  SET_PERSONAL_DATA = 'SET_PERSONAL_DATA',
  SET_PIN = 'SET_PIN',
}

export type NextEvent = {type: OnboardingEvents.NEXT};
type PreviousEvent = {type: OnboardingEvents.PREVIOUS};
type PersonalDataEvent = {type: OnboardingEvents.SET_PERSONAL_DATA; data: ISetPersonalDataActionArgs};
type TermsConditionsEvent = {type: OnboardingEvents.SET_TOC; data: boolean};
type PrivacyPolicyEvent = {type: OnboardingEvents.SET_POLICY; data: boolean};
type PinEvent = {type: OnboardingEvents.SET_PIN; data: string};
type DeclineEvent = {type: OnboardingEvents.DECLINE};
export type OnboardingEventTypes =
  | NextEvent
  | PreviousEvent
  | TermsConditionsEvent
  | PrivacyPolicyEvent
  | PersonalDataEvent
  | PinEvent
  | DeclineEvent;
const onboardingToSAgreementGuard = (ctx: IOnboardingMachineContext, _event: OnboardingEventTypes) =>
  ctx.termsConditionsAccepted && ctx.privacyPolicyAccepted;

const walletSetup = finalizeOnboarding;

export const onboardingSelector = (state: any, matchesState: OnboardingStates) => {
  return state.matches(matchesState);
};

export const createOnboardingMachine = () => {
  return createMachine<IOnboardingMachineContext, OnboardingEventTypes>({
    id: 'Onboarding',
    predictableActionArguments: true,
    initial: OnboardingStates.welcomeIntro,
    schema: {
      events: {} as OnboardingEventTypes,
      guards: {} as {type: 'onboardingToSAgreementGuard'} | {type: 'dsasddstermsConditionsAccepted'},
    },
    context: {
      termsConditionsAccepted: false,
      privacyPolicyAccepted: false,
      personalData: {},
      pinCode: '',
    } as IOnboardingMachineContext,

    states: {
      [OnboardingStates.welcomeIntro]: {
        on: {
          [OnboardingEvents.NEXT]: [
            {
              target: OnboardingStates.tosAgreement,
            },
          ],
        },
      },
      [OnboardingStates.tosAgreement]: {
        on: {
          [OnboardingEvents.SET_POLICY]: {
            actions: assign({privacyPolicyAccepted: (_ctx, e: PrivacyPolicyEvent) => e.data}),
          },
          [OnboardingEvents.SET_TOC]: {
            actions: assign({termsConditionsAccepted: (_ctx, e: TermsConditionsEvent) => e.data}),
          },
          [OnboardingEvents.DECLINE]: {
            target: OnboardingStates.onboardingDeclined,
          },
          [OnboardingEvents.NEXT]: {
            cond: 'onboardingToSAgreementGuard',
            target: OnboardingStates.personalDetailsEntry,
          },
          [OnboardingEvents.PREVIOUS]: {target: OnboardingStates.welcomeIntro},
        },
      },
      [OnboardingStates.personalDetailsEntry]: {
        on: {
          [OnboardingEvents.SET_PERSONAL_DATA]: {
            actions: assign({personalData: (_ctx, e: PersonalDataEvent) => e.data}),
          },
          [OnboardingEvents.NEXT]: {
            // cond: 'onboardingToSAgreementGuard',
            target: OnboardingStates.pinEntry,
          },
          [OnboardingEvents.PREVIOUS]: {target: OnboardingStates.tosAgreement},
        },
      },
      [OnboardingStates.pinEntry]: {
        on: {
          [OnboardingEvents.SET_PIN]: {
            actions: assign({pinCode: (_ctx, e: PinEvent) => e.data}),
          },
          [OnboardingEvents.NEXT]: {
            target: OnboardingStates.pinVerify,
          },
          [OnboardingEvents.PREVIOUS]: {
            target: OnboardingStates.personalDetailsEntry,
          },
        },
      },
      [OnboardingStates.pinVerify]: {
        on: {
          [OnboardingEvents.NEXT]: {
            target: OnboardingStates.personalDetailsVerify,
          },
          [OnboardingEvents.PREVIOUS]: {
            target: OnboardingStates.pinEntry,
          },
        },
      },
      [OnboardingStates.personalDetailsVerify]: {
        on: {
          [OnboardingEvents.NEXT]: {
            target: OnboardingStates.walletSetup,
          },
          [OnboardingEvents.PREVIOUS]: {
            target: OnboardingStates.pinEntry, // We are going back to pin entry and then verify
          },
        },
      },
      [OnboardingStates.walletSetup]: {
        invoke: {
          id: OnboardingStates.walletSetup,
          src: OnboardingStates.walletSetup,
          onDone: {
            target: OnboardingStates.onboardingDone,
            actions: assign((ctx, event) => {
              return event.data;
            }),
          },
        },
      },
      [OnboardingStates.onboardingDeclined]: {
        id: OnboardingStates.onboardingDeclined,
        always: OnboardingStates.welcomeIntro,
        onDone: {
          actions: assign((cxt, event) => {
            return {
              pinCode: '',
              personalData: {},
              privacyPolicyAccepted: false,
              termsConditionsAccepted: false,
            } as IOnboardingMachineContext;
          }),
        },
        // Since we are not allowed to exit an app by Apple/Google, we go back to the onboarding state when the user declines
      },
      [OnboardingStates.onboardingDone]: {type: 'final', id: OnboardingStates.onboardingDone},
    },
  });
};

export const onboardingNavigations = (
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
      {onNext},
    );
    // navigation.navigate(ScreenRoutesEnum.WELCOME, {step: 1});
  } else if (state.matches(OnboardingStates.tosAgreement)) {
    nav.navigate(ScreenRoutesEnum.TERMS_OF_SERVICE, {
      headerTitle: translate('terms_of_service_title'),
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
    });
  } else if (state.matches(OnboardingStates.personalDetailsEntry)) {
    nav.navigate(ScreenRoutesEnum.PERSONAL_DATA, {
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
      onBack,
      onNext,
    });
  } else if (state.matches(OnboardingStates.personalDetailsVerify)) {
    nav.navigate(ScreenRoutesEnum.ONBOARDING_SUMMARY, {onBack, onNext});
  } else if (state.matches(OnboardingStates.walletSetup)) {
    nav.navigate(ScreenRoutesEnum.LOADING, {
      message: translate('action_onboarding_setup_message'),
      onBack,
      onNext,
    });
  } else {
    console.log(`TODO navigation for ${state}`);
  }
};

interface OnboardingContextType {
  onboardingInstance: OnboardingInterpretType;
}

export const OnboardingContext = createContext({} as OnboardingContextType);

// We use this in class components, as there is no context available there. It is also used by default in the onboarding provider

export type OnboardingInterpretType = Interpreter<
  IOnboardingMachineContext,
  any,
  OnboardingEventTypes,
  {
    value: any;
    context: IOnboardingMachineContext;
  },
  any
>;

export class OnboardingMachine {
  static get instance(): OnboardingInterpretType {
    if (!this._instance) {
      throw Error('Please initialize an onboarding machine first');
    }
    return this._instance;
  }

  private static _instance: OnboardingInterpretType | undefined;

  static newInstance(opts?: {services?: any; guards?: any; subscription?: () => void; noDefaultNavigationHook?: boolean}): OnboardingInterpretType {
    const newInst: OnboardingInterpretType = interpret(
      createOnboardingMachine().withConfig({
        services: {...walletSetup, ...opts?.services},
        guards: {onboardingToSAgreementGuard, ...opts?.guards},
      }),
    );
    if (typeof opts?.subscription === 'function') {
      newInst.subscribe(opts.subscription);
    } else {
      newInst.subscribe(snapshot => {
        console.log(`CURRENT STATE: ${snapshot.value}`);
        console.log(JSON.stringify(snapshot));
        if (opts?.noDefaultNavigationHook !== true) {
          onboardingNavigations(newInst, snapshot);
        }
      });
    }
    return newInst;
  }

  static getInstance(opts?: {services?: any; guards?: any; subscription?: () => void; noDefaultNavigationHook?: boolean}): OnboardingInterpretType {
    if (!OnboardingMachine._instance) {
      OnboardingMachine._instance = OnboardingMachine.newInstance(opts);
    }
    return OnboardingMachine._instance;
  }
}

export const OnboardingProvider = (props: {children?: ReactNode | undefined; customOnboardingInstance?: OnboardingInterpretType}): JSX.Element => {
  return (
    <OnboardingContext.Provider value={{onboardingInstance: props.customOnboardingInstance ?? OnboardingMachine.getInstance()}}>
      {props.children}
    </OnboardingContext.Provider>
  );
};
