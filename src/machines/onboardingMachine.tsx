import {CredentialPayload} from '@veramo/core';

import Debug, {Debugger} from 'debug';
import {v4 as uuidv4} from 'uuid';
import {assign, createMachine, interpret} from 'xstate';
import {APP_ID, EMAIL_ADDRESS_VALIDATION_REGEX} from '../@config/constants';
import {onboardingStateNavigationListener} from '../navigation/machines/onboardingStateNavigation';
import {setupWallet} from '../services/machines/onboardingMachineService';
import {SupportedDidMethodEnum} from '../types';
import {
  CreateOnboardingMachineOpts,
  InstanceOnboardingMachineOpts,
  NextEvent,
  OnboardingMachineContext,
  OnboardingMachineEvents,
  OnboardingMachineEventTypes,
  OnboardingMachineGuards,
  OnboardingMachineInterpreter,
  OnboardingMachineState,
  OnboardingMachineStates,
  PersonalDataEvent,
  PinSetEvent,
  PrivacyPolicyEvent,
  TermsConditionsEvent,
  WalletSetupServiceResult,
} from '../types/machines/onboarding';

const debug: Debugger = Debug(`${APP_ID}:onboarding`);

const onboardingToSAgreementGuard = (ctx: OnboardingMachineContext, _event: OnboardingMachineEventTypes) =>
  ctx.termsConditionsAccepted && ctx.privacyPolicyAccepted;

const onboardingPersonalDataGuard = (ctx: OnboardingMachineContext, _event: OnboardingMachineEventTypes) => {
  const {firstName, lastName, emailAddress} = ctx.personalData;
  return firstName && firstName.length > 0 && lastName && lastName.length > 0 && emailAddress && EMAIL_ADDRESS_VALIDATION_REGEX.test(emailAddress);
};

const onboardingPinCodeSetGuard = (ctx: OnboardingMachineContext, _event: OnboardingMachineEventTypes) => {
  const {pinCode} = ctx;
  return pinCode && pinCode.length === 6;
};

const onboardingPinCodeVerifyGuard = (ctx: OnboardingMachineContext, event: NextEvent) => {
  return onboardingPinCodeSetGuard(ctx, event) && ctx.pinCode === event.data;
};

const createOnboardingMachine = (opts?: CreateOnboardingMachineOpts) => {
  const credentialData = {
    didMethod: opts?.credentialData?.didMethod ?? SupportedDidMethodEnum.DID_JWK,
    didOptions: opts?.credentialData?.didOptions ?? {/*codecName: 'EBSI',*/ type: 'Secp256r1'}, // todo: We need a preference/options provider supporting ecosystems
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

  return createMachine<OnboardingMachineContext, OnboardingMachineEventTypes>({
    id: opts?.machineId ?? 'Onboarding',
    predictableActionArguments: true,
    initial: OnboardingMachineStates.showIntro,
    schema: {
      events: {} as OnboardingMachineEventTypes,
      guards: {} as
        | {
            type: OnboardingMachineGuards.onboardingPersonalDataGuard;
          }
        | {
            type: OnboardingMachineGuards.onboardingToSAgreementGuard;
          }
        | {
            type: OnboardingMachineGuards.onboardingPinCodeSetGuard;
          }
        | {
            type: OnboardingMachineGuards.onboardingPinCodeVerifyGuard;
          },
      services: {} as {
        [OnboardingMachineStates.setupWallet]: {
          data: WalletSetupServiceResult;
        };
      },
    },
    context: {
      ...initialContext,
    },

    states: {
      [OnboardingMachineStates.showIntro]: {
        on: {
          [OnboardingMachineEvents.NEXT]: [
            {
              target: OnboardingMachineStates.acceptAgreement,
            },
          ],
        },
      },
      [OnboardingMachineStates.acceptAgreement]: {
        on: {
          [OnboardingMachineEvents.SET_POLICY]: {
            actions: assign({privacyPolicyAccepted: (_ctx: OnboardingMachineContext, e: PrivacyPolicyEvent) => e.data}),
          },
          [OnboardingMachineEvents.SET_TOC]: {
            actions: assign({termsConditionsAccepted: (_ctx: OnboardingMachineContext, e: TermsConditionsEvent) => e.data}),
          },
          [OnboardingMachineEvents.DECLINE]: {
            target: OnboardingMachineStates.declineOnboarding,
          },
          [OnboardingMachineEvents.NEXT]: {
            cond: OnboardingMachineGuards.onboardingToSAgreementGuard,
            target: OnboardingMachineStates.enterPersonalDetails,
          },
          [OnboardingMachineEvents.PREVIOUS]: {target: OnboardingMachineStates.showIntro},
        },
      },
      [OnboardingMachineStates.enterPersonalDetails]: {
        on: {
          [OnboardingMachineEvents.SET_PERSONAL_DATA]: {
            actions: assign({personalData: (_ctx: OnboardingMachineContext, e: PersonalDataEvent) => e.data}),
          },
          [OnboardingMachineEvents.NEXT]: {
            cond: OnboardingMachineGuards.onboardingPersonalDataGuard,
            target: OnboardingMachineStates.enterPin,
          },
          [OnboardingMachineEvents.PREVIOUS]: {target: OnboardingMachineStates.acceptAgreement},
        },
      },
      [OnboardingMachineStates.enterPin]: {
        on: {
          [OnboardingMachineEvents.SET_PIN]: {
            actions: assign({pinCode: (_ctx: OnboardingMachineContext, e: PinSetEvent) => e.data}),
          },
          [OnboardingMachineEvents.NEXT]: {
            cond: OnboardingMachineGuards.onboardingPinCodeSetGuard,
            target: OnboardingMachineStates.verifyPin,
          },
          [OnboardingMachineEvents.PREVIOUS]: {
            target: OnboardingMachineStates.enterPersonalDetails,
          },
        },
      },
      [OnboardingMachineStates.verifyPin]: {
        on: {
          [OnboardingMachineEvents.NEXT]: {
            cond: OnboardingMachineGuards.onboardingPinCodeVerifyGuard,
            target: OnboardingMachineStates.verifyPersonalDetails,
          },
          [OnboardingMachineEvents.PREVIOUS]: {
            target: OnboardingMachineStates.enterPin,
          },
        },
      },
      [OnboardingMachineStates.verifyPersonalDetails]: {
        on: {
          [OnboardingMachineEvents.NEXT]: {
            target: OnboardingMachineStates.setupWallet,
          },
          [OnboardingMachineEvents.PREVIOUS]: {
            target: OnboardingMachineStates.enterPin, // We are going back to pin entry and then verify
          },
        },
      },
      [OnboardingMachineStates.setupWallet]: {
        invoke: {
          id: OnboardingMachineStates.setupWallet,
          src: OnboardingMachineStates.setupWallet,
          onDone: {
            target: OnboardingMachineStates.finishOnboarding,
          },
          // todo: On Error
        },
      },
      [OnboardingMachineStates.declineOnboarding]: {
        id: OnboardingMachineStates.declineOnboarding,
        always: OnboardingMachineStates.showIntro,
        entry: assign({
          ...initialContext,
        }),
        // Since we are not allowed to exit an app by Apple/Google, we go back to the onboarding state when the user declines
      },
      [OnboardingMachineStates.finishOnboarding]: {
        type: 'final',
        id: OnboardingMachineStates.finishOnboarding,
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
    return OnboardingMachine._instance !== undefined;
  }

  static get instance(): OnboardingMachineInterpreter {
    if (!OnboardingMachine._instance) {
      throw Error('Please initialize an onboarding machine first');
    }
    return OnboardingMachine._instance;
  }

  static clearInstance(opts: {stop: boolean}) {
    const {stop} = opts;
    if (OnboardingMachine.hasInstance()) {
      if (stop) {
        this.stopInstance();
      }
    }
    OnboardingMachine._instance = undefined;
  }

  static stopInstance(): void {
    debug(`Stopping onboarding instance...`);
    if (!OnboardingMachine.hasInstance()) {
      debug(`No onboarding instance present to stop`);
      return;
    }
    OnboardingMachine.instance.stop();
    OnboardingMachine._instance = undefined;
    debug(`Stopped onboarding instance`);
  }

  // todo: Determine whether we need to make this public for the onboarding machine as there normally should only be 1
  private static newInstance(opts?: InstanceOnboardingMachineOpts): OnboardingMachineInterpreter {
    debug(`Creating new onboarding instance`, opts);
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
    }
    if (opts?.requireCustomNavigationHook !== true) {
      debug(`Onboarding machine hookup state navigation listener`, opts);
      newInst.onTransition((snapshot: OnboardingMachineState): void => {
        void onboardingStateNavigationListener(newInst, snapshot);
      });
    }
    debug(`New onboarding instance created`, opts);
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
