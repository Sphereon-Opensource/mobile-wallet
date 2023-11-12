import {CredentialPayload} from '@veramo/core';
import {createContext} from 'react';
import {v4 as uuidv4} from 'uuid';
import {assign, createMachine, interpret} from 'xstate';
import {EMAIL_ADDRESS_VALIDATION_REGEX} from '../@config/constants';
import {onboardingStateNavigationListener} from '../navigation/onboardingStateNavigation';
import {walletSetup} from '../services/onboardingService';
import {SupportedDidMethodEnum} from '../types';
import {
  ICreateOnboardingMachineOpts,
  IInstanceOnboardingMachineOpts,
  IOnboardingMachineContext,
  NextEvent,
  OnboardingContextType,
  OnboardingEvents,
  OnboardingEventTypes,
  OnboardingGuards,
  OnboardingInterpretType,
  OnboardingStates,
  PersonalDataEvent,
  PinSetEvent,
  PrivacyPolicyEvent,
  TermsConditionsEvent,
} from '../types/onboarding';

const onboardingToSAgreementGuard = (ctx: IOnboardingMachineContext, _event: OnboardingEventTypes) =>
  ctx.termsConditionsAccepted && ctx.privacyPolicyAccepted;

const onboardingPersonalDataGuard = (ctx: IOnboardingMachineContext, _event: OnboardingEventTypes) => {
  const {firstName, lastName, emailAddress} = ctx.personalData;
  return firstName && firstName.length > 0 && lastName && lastName.length > 0 && emailAddress && EMAIL_ADDRESS_VALIDATION_REGEX.test(emailAddress);
};

const onboardingPinCodeSetGuard = (ctx: IOnboardingMachineContext, _event: OnboardingEventTypes) => {
  const {pinCode} = ctx;
  return pinCode && pinCode.length === 6;
};

const onboardingPinCodeVerifyGuard = (ctx: IOnboardingMachineContext, event: NextEvent) => {
  return onboardingPinCodeSetGuard(ctx, event) && ctx.pinCode === event.data;
};

const createOnboardingMachine = (opts?: ICreateOnboardingMachineOpts) => {
  const credentialData = {
    didMethod: opts?.credentialData?.didMethod ?? SupportedDidMethodEnum.DID_KEY,
    proofFormat: opts?.credentialData?.proofFormat ?? 'jwt',
    credential:
      opts?.credentialData?.credential ??
      ({
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld',
        ],
        id: `urn:uuid:${uuidv4()}`,
        type: ['VerifiableCredential', 'SphereonWalletIdentityCredential'],
        issuanceDate: new Date(),
        credentialSubject: {},
      } as Partial<CredentialPayload>),
  };

  const initialContext = {
    credentialData,
    termsConditionsAccepted: false,
    privacyPolicyAccepted: false,
    personalData: {},
    pinCode: '',
  } as IOnboardingMachineContext;

  return createMachine<IOnboardingMachineContext, OnboardingEventTypes>({
    id: opts?.machineId ?? 'Onboarding',
    predictableActionArguments: true,
    initial: OnboardingStates.welcomeIntro,
    schema: {
      events: {} as OnboardingEventTypes,
      guards: {} as
        | {
            type: OnboardingGuards.onboardingPersonalDataGuard;
          }
        | {
            type: OnboardingGuards.onboardingToSAgreementGuard;
          }
        | {
            type: OnboardingGuards.onboardingPinCodeSetGuard;
          }
        | {
            type: OnboardingGuards.onboardingPinCodeVerifyGuard;
          },
    },
    context: {
      ...initialContext,
    },

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
            cond: OnboardingGuards.onboardingToSAgreementGuard,
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
            cond: OnboardingGuards.onboardingPersonalDataGuard,
            target: OnboardingStates.pinEntry,
          },
          [OnboardingEvents.PREVIOUS]: {target: OnboardingStates.tosAgreement},
        },
      },
      [OnboardingStates.pinEntry]: {
        on: {
          [OnboardingEvents.SET_PIN]: {
            actions: assign({pinCode: (_ctx, e: PinSetEvent) => e.data}),
          },
          [OnboardingEvents.NEXT]: {
            cond: OnboardingGuards.onboardingPinCodeSetGuard,
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
            cond: OnboardingGuards.onboardingPinCodeVerifyGuard,
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
          },
          // todo: On Error
        },
      },
      [OnboardingStates.onboardingDeclined]: {
        id: OnboardingStates.onboardingDeclined,
        always: OnboardingStates.welcomeIntro,
        entry: assign({
          ...initialContext,
        }),
        // Since we are not allowed to exit an app by Apple/Google, we go back to the onboarding state when the user declines
      },
      [OnboardingStates.onboardingDone]: {
        type: 'final',
        id: OnboardingStates.onboardingDone,
        entry: assign({
          pinCode: '',
          personalData: undefined,
          credentialData: undefined,
          privacyPolicyAccepted: false,
          termsConditionsAccepted: false,
        }),
      },
    },
  });
};

export type CreateOnboardingMachineType = typeof createOnboardingMachine;
export const OnboardingContext = createContext({} as OnboardingContextType);

export class OnboardingMachine {
  private static _instance: OnboardingInterpretType | undefined;

  static hasInstance(): boolean {
    return !!OnboardingMachine._instance;
  }

  static get instance(): OnboardingInterpretType {
    if (!this._instance) {
      throw Error('Please initialize an onboarding machine first');
    }
    return this._instance;
  }

  static stopInstance() {
    console.log(`Stop instance...`);
    if (!OnboardingMachine.hasInstance()) {
      return;
    }
    OnboardingMachine.instance.stop();
    OnboardingMachine._instance = undefined;
    console.log(`Stopped instance`);
  }

  // todo: Determine whether we need to make this public for the onboarding machine as there normally should only be 1
  private static newInstance(opts?: IInstanceOnboardingMachineOpts): OnboardingInterpretType {
    const newInst: OnboardingInterpretType = interpret(
      createOnboardingMachine(opts).withConfig({
        services: {walletSetup, ...opts?.services},
        guards: {onboardingToSAgreementGuard, onboardingPersonalDataGuard, onboardingPinCodeSetGuard, onboardingPinCodeVerifyGuard, ...opts?.guards},
      }),
    );
    if (typeof opts?.subscription === 'function') {
      newInst.onTransition(opts.subscription);
    } else if (opts?.requireCustomNavigationHook !== true) {
      newInst.onTransition(snapshot => {
        console.log(`CURRENT STATE: ${JSON.stringify(snapshot.value)}: context: ${JSON.stringify(snapshot.context)}`);
        onboardingStateNavigationListener(newInst, snapshot);
      });
    }
    return newInst;
  }

  static getInstance(
    opts?: IInstanceOnboardingMachineOpts & {
      requireExisting?: boolean;
    },
  ): OnboardingInterpretType {
    if (!OnboardingMachine._instance) {
      if (opts?.requireExisting === true) {
        throw Error(`Existing onboarding instance requested, but none was created at this point!`);
      }
      OnboardingMachine._instance = OnboardingMachine.newInstance(opts);
    }
    return OnboardingMachine._instance;
  }
}
