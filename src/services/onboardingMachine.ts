import {useMachine} from '@xstate/react';
import React, {useMemo} from 'react';
import {assign, createMachine} from 'xstate';

export const OnboardingContext = React.createContext({});

export interface OnboardingMachineContext {
  termsConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  pinCode: string;
  accountDetails: any;
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

type TermsConditionsEvent = {type: 'SET_TOC'; data: boolean};
type PrivacyPolicyEvent = {type: 'SET_POLICY'; data: boolean};
type Events = TermsConditionsEvent | PrivacyPolicyEvent;
const tosAgreement = (ctx: OnboardingMachineContext, _event: Events) => ctx.termsConditionsAccepted && ctx.privacyPolicyAccepted;

// const actions: ActionFunctionMap<OnboardingMachineContext, OnboardingEvent> = {
//   saveFormData: assign((context, event) => (event.type === 'NEXT' ? {...context, ...event.payload} : context)),
// };
// export const OnboardingMachine = createMachine<OnboardingMachineContext>(

export const createOnboardingMachine = () => {
  const machine = createMachine<OnboardingMachineContext>({
    id: 'Onboarding',
    initial: OnboardingStates.welcomeIntro,
    schema: {
      events: {} as Events,
      guards: {} as {type: 'tosAgreement'} | {type: 'dsasddstermsConditionsAccepted'},
    },
    context: {
      termsConditionsAccepted: false,
      privacyPolicyAccepted: false,
    } as OnboardingMachineContext,

    states: {
      welcomeIntro: {
        on: {
          NEXT: [
            {
              target: OnboardingStates.tosAgreement,
            },
          ],
        },
        invoke: {
          id: OnboardingStates.welcomeIntro,
          src: OnboardingStates.welcomeIntro,
        },
      },
      tosAgreement: {
        on: {
          SET_POLICY: {
            actions: assign({privacyPolicyAccepted: (_ctx, e: PrivacyPolicyEvent) => e.data}),
          },
          SET_TC: {
            actions: assign({termsConditionsAccepted: (_ctx, e: TermsConditionsEvent) => e.data}),
          },
          NEXT: {
            cond: 'tosAgreement',
            target: OnboardingStates.personalDetailsEntry,
          },
          PREVIOUS: OnboardingStates.welcomeIntro,
        },
        invoke: {
          id: OnboardingStates.tosAgreement,
          src: OnboardingStates.tosAgreement,
          onError: {
            target: OnboardingStates.onboardingDeclined,
          },
          onDone: {
            cond: (ctx, event) => ctx.privacyPolicyAccepted && ctx.termsConditionsAccepted,
          },
        },
      },
      personalDetailsEntry: {
        invoke: {
          id: OnboardingStates.personalDetailsEntry,
          src: OnboardingStates.personalDetailsEntry,
          onDone: {
            target: 'pinEntry',
            actions: assign((ctx, event) => {
              return event.data;
            }),
          },
          onError: {
            target: 'onboardingDeclined',
          },
        },
      },
      pinEntry: {
        invoke: {
          id: OnboardingStates.pinEntry,
          src: OnboardingStates.pinEntry,
          onDone: {
            target: OnboardingStates.pinVerify,
            actions: assign((ctx, event) => {
              return event.data;
            }),
          },
          onError: {
            target: OnboardingStates.onboardingDeclined,
          },
        },
      },
      pinVerify: {
        invoke: {
          id: OnboardingStates.pinVerify,
          src: OnboardingStates.pinVerify,
          onDone: {
            target: OnboardingStates.personalDetailsVerify,
            actions: assign((ctx, event) => {
              return event.data;
            }),
          },
        },
      },
      personalDetailsVerify: {
        invoke: {
          id: OnboardingStates.personalDetailsVerify,
          src: OnboardingStates.personalDetailsVerify,
          onDone: {
            target: 'walletSetup',
            actions: assign((ctx, event) => {
              return event.data;
            }),
          },
        },
      },
      walletSetup: {
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
      onboardingDone: {type: 'final', id: OnboardingStates.onboardingDone},
      onboardingDeclined: {type: 'final', id: OnboardingStates.onboardingDeclined},
    },
  });
  return machine;
};
export const useOnboardingMachine = () => {
  const machine = useMemo(() => createOnboardingMachine(), []);
  const [{value: stateValue, context}, send] = useMachine(machine);
  const value = stateValue; //as WizardState;
  return [{value, context}, send] as const;
};
