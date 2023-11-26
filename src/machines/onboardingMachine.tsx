import {Context, createContext} from 'react';
import {assign, createMachine, interpret} from 'xstate';
import {v4 as uuidv4} from 'uuid';
import {CredentialPayload} from '@veramo/core';
import {setupWallet} from '../services/machines/onboardingMachineService';
import {onboardingStateNavigationListener} from '../navigation/machines/onboardingStateNavigation';
import {APP_ID, EMAIL_ADDRESS_VALIDATION_REGEX} from '../@config/constants';
import {SupportedDidMethodEnum} from '../types';
import {
  CreateOnboardingMachineOpts,
  InstanceOnboardingMachineOpts,
  OnboardingMachineContext,
  NextEvent,
  OnboardingContext,
  OnboardingEvents,
  OnboardingEventTypes,
  OnboardingGuards,
  OnboardingMachineInterpreter,
  OnboardingMachineState,
  OnboardingStates,
  PersonalDataEvent,
  PinSetEvent,
  PrivacyPolicyEvent,
  TermsConditionsEvent,
  WalletSetupServiceResult,
} from '../types/machines/onboarding';

import Debug, {Debugger} from 'debug';
const debug: Debugger = Debug(`${APP_ID}:onboarding`);

const onboardingToSAgreementGuard = (ctx: OnboardingMachineContext, _event: OnboardingEventTypes) =>
  ctx.termsConditionsAccepted && ctx.privacyPolicyAccepted;

const onboardingPersonalDataGuard = (ctx: OnboardingMachineContext, _event: OnboardingEventTypes) => {
  const {firstName, lastName, emailAddress} = ctx.personalData;
  return firstName && firstName.length > 0 && lastName && lastName.length > 0 && emailAddress && EMAIL_ADDRESS_VALIDATION_REGEX.test(emailAddress);
};

const onboardingPinCodeSetGuard = (ctx: OnboardingMachineContext, _event: OnboardingEventTypes) => {
  const {pinCode} = ctx;
  return pinCode && pinCode.length === 6;
};

const onboardingPinCodeVerifyGuard = (ctx: OnboardingMachineContext, event: NextEvent) => {
  return onboardingPinCodeSetGuard(ctx, event) && ctx.pinCode === event.data;
};

const createOnboardingMachine = (opts?: CreateOnboardingMachineOpts) => {
  const credentialData = {
    didMethod: opts?.credentialData?.didMethod ?? SupportedDidMethodEnum.DID_OYD,
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

  const initialContext: OnboardingMachineContext = {
    credentialData,
    termsConditionsAccepted: false,
    privacyPolicyAccepted: false,
    personalData: {},
    pinCode: '',
  } as OnboardingMachineContext;

  return createMachine<OnboardingMachineContext, OnboardingEventTypes>({
    id: opts?.machineId ?? 'Onboarding',
    predictableActionArguments: true,
    initial: OnboardingStates.showIntro,
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
      services: {} as {
        [OnboardingStates.setupWallet]: {
          data: WalletSetupServiceResult;
        };
      },
    },
    context: {
      ...initialContext,
    },

    states: {
      [OnboardingStates.showIntro]: {
        on: {
          [OnboardingEvents.NEXT]: [
            {
              target: OnboardingStates.acceptAgreement,
            },
          ],
        },
      },
      [OnboardingStates.acceptAgreement]: {
        on: {
          [OnboardingEvents.SET_POLICY]: {
            actions: assign({privacyPolicyAccepted: (_ctx: OnboardingMachineContext, e: PrivacyPolicyEvent) => e.data}),
          },
          [OnboardingEvents.SET_TOC]: {
            actions: assign({termsConditionsAccepted: (_ctx: OnboardingMachineContext, e: TermsConditionsEvent) => e.data}),
          },
          [OnboardingEvents.DECLINE]: {
            target: OnboardingStates.declineOnboarding,
          },
          [OnboardingEvents.NEXT]: {
            cond: OnboardingGuards.onboardingToSAgreementGuard,
            target: OnboardingStates.enterPersonalDetails,
          },
          [OnboardingEvents.PREVIOUS]: {target: OnboardingStates.showIntro},
        },
      },
      [OnboardingStates.enterPersonalDetails]: {
        on: {
          [OnboardingEvents.SET_PERSONAL_DATA]: {
            actions: assign({personalData: (_ctx: OnboardingMachineContext, e: PersonalDataEvent) => e.data}),
          },
          [OnboardingEvents.NEXT]: {
            cond: OnboardingGuards.onboardingPersonalDataGuard,
            target: OnboardingStates.enterPin,
          },
          [OnboardingEvents.PREVIOUS]: {target: OnboardingStates.acceptAgreement},
        },
      },
      [OnboardingStates.enterPin]: {
        on: {
          [OnboardingEvents.SET_PIN]: {
            actions: assign({pinCode: (_ctx: OnboardingMachineContext, e: PinSetEvent) => e.data}),
          },
          [OnboardingEvents.NEXT]: {
            cond: OnboardingGuards.onboardingPinCodeSetGuard,
            target: OnboardingStates.verifyPin,
          },
          [OnboardingEvents.PREVIOUS]: {
            target: OnboardingStates.enterPersonalDetails,
          },
        },
      },
      [OnboardingStates.verifyPin]: {
        on: {
          [OnboardingEvents.NEXT]: {
            cond: OnboardingGuards.onboardingPinCodeVerifyGuard,
            target: OnboardingStates.verifyPersonalDetails,
          },
          [OnboardingEvents.PREVIOUS]: {
            target: OnboardingStates.enterPin,
          },
        },
      },
      [OnboardingStates.verifyPersonalDetails]: {
        on: {
          [OnboardingEvents.NEXT]: {
            target: OnboardingStates.setupWallet,
          },
          [OnboardingEvents.PREVIOUS]: {
            target: OnboardingStates.enterPin, // We are going back to pin entry and then verify
          },
        },
      },
      [OnboardingStates.setupWallet]: {
        invoke: {
          id: OnboardingStates.setupWallet,
          src: OnboardingStates.setupWallet,
          onDone: {
            target: OnboardingStates.finishOnboarding,
          },
          // todo: On Error
        },
      },
      [OnboardingStates.declineOnboarding]: {
        id: OnboardingStates.declineOnboarding,
        always: OnboardingStates.showIntro,
        entry: assign({
          ...initialContext,
        }),
        // Since we are not allowed to exit an app by Apple/Google, we go back to the onboarding state when the user declines
      },
      [OnboardingStates.finishOnboarding]: {
        type: 'final',
        id: OnboardingStates.finishOnboarding,
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

export class OnboardingMachine {
  private static _instance: OnboardingMachineInterpreter | undefined;

  static hasInstance(): boolean {
    return !!OnboardingMachine._instance;
  }

  static get instance(): OnboardingMachineInterpreter {
    if (!this._instance) {
      throw Error('Please initialize an onboarding machine first');
    }
    return this._instance;
  }

  static stopInstance(): void {
    debug(`Stop instance...`);
    if (!OnboardingMachine.hasInstance()) {
      return;
    }
    OnboardingMachine.instance.stop();
    OnboardingMachine._instance = undefined;
    debug(`Stopped instance`);
  }

  // todo: Determine whether we need to make this public for the onboarding machine as there normally should only be 1
  private static newInstance(opts?: InstanceOnboardingMachineOpts): OnboardingMachineInterpreter {
    const newInst: OnboardingMachineInterpreter = interpret(
      createOnboardingMachine(opts).withConfig({
        services: {setupWallet, ...opts?.services},
        guards: {
          onboardingToSAgreementGuard,
          onboardingPersonalDataGuard,
          onboardingPinCodeSetGuard,
          onboardingPinCodeVerifyGuard,
          ...opts?.guards,
        },
      }),
    );
    if (typeof opts?.subscription === 'function') {
      newInst.onTransition(opts.subscription);
    } else if (opts?.requireCustomNavigationHook !== true) {
      newInst.onTransition((snapshot: OnboardingMachineState): void => {
        void onboardingStateNavigationListener(newInst, snapshot);
      });
    }
    return newInst;
  }

  static getInstance(
    opts?: InstanceOnboardingMachineOpts & {
      requireExisting?: boolean;
    },
  ): OnboardingMachineInterpreter {
    if (!OnboardingMachine._instance) {
      if (opts?.requireExisting === true) {
        throw Error(`Existing onboarding instance requested, but none was created at this point!`);
      }
      OnboardingMachine._instance = OnboardingMachine.newInstance(opts);
    }
    return OnboardingMachine._instance;
  }
}
