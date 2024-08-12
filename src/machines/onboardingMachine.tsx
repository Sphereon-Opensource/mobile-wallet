import {CredentialPayload} from '@veramo/core';
import Debug, {Debugger} from 'debug';
import {v4 as uuidv4} from 'uuid';
import {GuardPredicate, assign, createMachine, interpret} from 'xstate';
import {APP_ID, PIN_CODE_LENGTH} from '../@config/constants';
import {onboardingStateNavigationListener} from '../navigation/machines/onboardingStateNavigation';
import {SupportedDidMethodEnum} from '../types';
import {
  Country,
  CreateOnboardingMachineOpts,
  InstanceOnboardingMachineOpts,
  OnboardingMachineContext,
  OnboardingMachineEventTypes,
  OnboardingMachineGuards,
  OnboardingMachineInterpreter,
  OnboardingMachineState,
  OnboardingMachineStateType,
  OnboardingMachineStep,
  OnboardingStatesConfig,
} from '../types/machines/onboarding';
import {IsValidEmail, isNonEmptyString, isNotNil, isNotSameDigits, isNotSequentialDigits, isStringOfLength, validate} from '../utils/validate';

const debug: Debugger = Debug(`${APP_ID}:onboarding`);

const validatePinCode = (pinCode: string) =>
  validate(pinCode, [isStringOfLength(PIN_CODE_LENGTH)()]).isValid && validate(Number(pinCode), [isNotSameDigits(), isNotSequentialDigits()]).isValid;

type OnboardingGuard = GuardPredicate<OnboardingMachineContext, OnboardingMachineEventTypes>['predicate'];

const isStepCreateWallet: OnboardingGuard = ({currentStep}) => currentStep === OnboardingMachineStep.CREATE_WALLET;
const isStepSecureWallet: OnboardingGuard = ({currentStep}) => currentStep === OnboardingMachineStep.SECURE_WALLET;
const isStepImportPersonalData: OnboardingGuard = ({currentStep}) => currentStep === OnboardingMachineStep.IMPORT_PERSONAL_DATA;
const isNameValid: OnboardingGuard = ({name}) => validate(name, [isNonEmptyString()]).isValid;
const isEmailValid: OnboardingGuard = ({emailAddress}) => validate(emailAddress, [isNonEmptyString(), IsValidEmail()]).isValid;
const isCountryValid: OnboardingGuard = ({country}) => validate(country, [isNotNil()]).isValid;
const isPinCodeValid: OnboardingGuard = ({pinCode}) => validatePinCode(pinCode);
const doPinsMatch: OnboardingGuard = ({pinCode, verificationPinCode}) =>
  validatePinCode(pinCode) && validatePinCode(verificationPinCode) && pinCode === verificationPinCode;

const states: OnboardingStatesConfig = {
  showIntro: {
    on: {
      NEXT: OnboardingMachineStateType.showProgress,
    },
  },
  showProgress: {
    on: {
      NEXT: [
        {cond: OnboardingMachineGuards.isStepCreateWallet, target: OnboardingMachineStateType.enterName},
        {cond: OnboardingMachineGuards.isStepSecureWallet, target: OnboardingMachineStateType.enterPinCode},
        {cond: OnboardingMachineGuards.isStepImportPersonalData, target: OnboardingMachineStateType.importDataConsent},
      ],
      PREVIOUS: [
        {cond: OnboardingMachineGuards.isStepCreateWallet, target: OnboardingMachineStateType.showIntro},
        {
          cond: OnboardingMachineGuards.isStepSecureWallet,
          target: OnboardingMachineStateType.enterCountry,
          actions: assign({currentStep: 1}),
        },
        {
          cond: ({currentStep}) => currentStep === 3,
          target: OnboardingMachineStateType.acceptTermsAndPrivacy,
          actions: assign({currentStep: 2}),
        },
      ],
    },
  },
  enterName: {
    on: {
      NEXT: {cond: OnboardingMachineGuards.isNameValid, target: OnboardingMachineStateType.enterEmailAddress},
      PREVIOUS: OnboardingMachineStateType.showProgress,
      SET_NAME: {actions: assign({name: (_, event) => event.data})},
    },
  },
  enterEmailAddress: {
    on: {
      NEXT: {cond: OnboardingMachineGuards.isEmailValid, target: OnboardingMachineStateType.enterCountry},
      PREVIOUS: OnboardingMachineStateType.enterName,
      SET_EMAIL_ADDRESS: {actions: assign({emailAddress: (_, event) => event.data})},
    },
  },
  enterCountry: {
    on: {
      NEXT: {
        cond: OnboardingMachineGuards.isCountryValid,
        target: OnboardingMachineStateType.showProgress,
        actions: assign({currentStep: 2}),
      },
      PREVIOUS: OnboardingMachineStateType.enterEmailAddress,
      SET_COUNTRY: {actions: assign({country: (_, event) => event.data})},
    },
  },
  enterPinCode: {
    on: {
      NEXT: [
        {
          cond: OnboardingMachineGuards.doPinsMatch,
          target: OnboardingMachineStateType.enableBiometrics,
        },
        {
          cond: OnboardingMachineGuards.isPinCodeValid,
          target: OnboardingMachineStateType.verifyPinCode,
        },
      ],
      PREVIOUS: OnboardingMachineStateType.showProgress,
      SET_PIN_CODE: {actions: assign({pinCode: (_, event) => event.data})},
      SET_VERIFICATION_PIN_CODE: {actions: assign({verificationPinCode: (_, event) => event.data})},
    },
  },
  verifyPinCode: {
    on: {
      NEXT: {
        cond: OnboardingMachineGuards.doPinsMatch,
        target: OnboardingMachineStateType.enableBiometrics,
      },
      PREVIOUS: OnboardingMachineStateType.enterPinCode,
      SET_VERIFICATION_PIN_CODE: {actions: assign({verificationPinCode: (_, event) => event.data})},
    },
  },
  enableBiometrics: {
    on: {
      NEXT: OnboardingMachineStateType.acceptTermsAndPrivacy,
      PREVIOUS: OnboardingMachineStateType.enterPinCode,
    },
  },
  acceptTermsAndPrivacy: {
    on: {
      READ_TERMS: OnboardingMachineStateType.readTerms,
      READ_PRIVACY: OnboardingMachineStateType.readPrivacy,
      PREVIOUS: OnboardingMachineStateType.enableBiometrics,
      NEXT: {
        target: OnboardingMachineStateType.showProgress,
        actions: assign({currentStep: 3}),
      },
    },
  },
  readTerms: {
    on: {
      PREVIOUS: OnboardingMachineStateType.acceptTermsAndPrivacy,
    },
  },
  readPrivacy: {
    on: {
      PREVIOUS: OnboardingMachineStateType.acceptTermsAndPrivacy,
    },
  },
  importDataConsent: {
    on: {
      PREVIOUS: OnboardingMachineStateType.showProgress,
      NEXT: OnboardingMachineStateType.importPersonalData,
    },
  },
  importPersonalData: {
    on: {
      PREVIOUS: OnboardingMachineStateType.importDataConsent,
    },
  },
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
    name: '',
    emailAddress: '',
    country: Country.DEUTSCHLAND,
    pinCode: '',
    verificationPinCode: '',
    biometricsEnabled: false,
    termsAndPrivacyAccepted: false,
    currentStep: 1,
  };

  return createMachine<OnboardingMachineContext, OnboardingMachineEventTypes>({
    /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgAoBbAQwGMALASwzAEp8QAHLWKgFyqw0YA9EAjACZ0AT0FDkU5EA */
    id: 'Onboarding',
    predictableActionArguments: true,
    initial: OnboardingMachineStateType.showIntro,
    context: initialContext,
    schema: {
      events: {} as OnboardingMachineEventTypes,
      guards: {} as
        | {
          type: OnboardingMachineGuards.isStepCreateWallet;
        }
        | {
          type: OnboardingMachineGuards.isStepSecureWallet;
        }
        | {
          type: OnboardingMachineGuards.isStepImportPersonalData;
        }
        | {
          type: OnboardingMachineGuards.isNameValid;
        }
        | {
          type: OnboardingMachineGuards.isEmailValid;
        }
        | {
          type: OnboardingMachineGuards.isCountryValid;
        }
        | {
          type: OnboardingMachineGuards.isPinCodeValid;
        }
        | {
          type: OnboardingMachineGuards.doPinsMatch;
        },
    },
    states: states,
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
        guards: {
          isStepCreateWallet,
          isStepSecureWallet,
          isStepImportPersonalData,
          isNameValid,
          isEmailValid,
          isCountryValid,
          isPinCodeValid,
          doPinsMatch,
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
