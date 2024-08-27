import {CredentialPayload} from '@veramo/core';
import Debug, {Debugger} from 'debug';
import {v4 as uuidv4} from 'uuid';
import {GuardPredicate, assign, createMachine, interpret, DoneInvokeEvent} from 'xstate';
import {APP_ID, PIN_CODE_LENGTH} from '../@config/constants';
import {onboardingStateNavigationListener} from '../navigation/machines/onboardingStateNavigation';
import {ErrorDetails, SupportedDidMethodEnum} from '../types';
import {
  Country,
  CreateOnboardingMachineOpts,
  InstanceOnboardingMachineOpts,
  MappedCredential,
  OnboardingBiometricsStatus,
  OnboardingMachineContext,
  OnboardingMachineEventTypes,
  OnboardingMachineGuards,
  OnboardingMachineInterpreter,
  OnboardingMachineServices,
  OnboardingMachineState,
  OnboardingMachineStateType,
  OnboardingMachineStep,
  OnboardingStatesConfig,
} from '../types/machines/onboarding';
import {IsValidEmail, isNonEmptyString, isNotNil, isNotSameDigits, isNotSequentialDigits, isStringOfLength, validate} from '../utils/validate';
import {retrievePIDCredentials, setupWallet, storePIDCredentials} from '../services/machines/onboardingMachineService';
import {translate} from '../localization/Localization';

const debug: Debugger = Debug(`${APP_ID}:onboarding`);

const isStepCreateWallet = (ctx: OnboardingMachineContext) => ctx.currentStep === OnboardingMachineStep.CREATE_WALLET;
const isStepSecureWallet = (ctx: OnboardingMachineContext) => ctx.currentStep === OnboardingMachineStep.SECURE_WALLET;
const isStepComplete: OnboardingGuard = ({currentStep}) => currentStep === OnboardingMachineStep.FINAL;
const isBiometricsEnabled = (ctx: OnboardingMachineContext) => {
  console.log('here');
  return ctx.biometricsEnabled === OnboardingBiometricsStatus.ENABLED;
};
const isBiometricsDisabled = (ctx: OnboardingMachineContext) => ctx.biometricsEnabled === OnboardingBiometricsStatus.DISABLED;
const isBiometricsUndetermined = (ctx: OnboardingMachineContext) => ctx.biometricsEnabled === OnboardingBiometricsStatus.INDETERMINATE;
const validatePinCode = (pinCode: string) =>
  validate(pinCode, [isStringOfLength(PIN_CODE_LENGTH)()]).isValid && validate(Number(pinCode), [isNotSameDigits(), isNotSequentialDigits()]).isValid;

type OnboardingGuard = GuardPredicate<OnboardingMachineContext, OnboardingMachineEventTypes>['predicate'];

const isStepImportPersonalData: OnboardingGuard = ({currentStep}) => currentStep === OnboardingMachineStep.IMPORT_PERSONAL_DATA;
const isNameValid: OnboardingGuard = ({name}) => validate(name, [isNonEmptyString()]).isValid;
const isEmailValid: OnboardingGuard = ({emailAddress}) => validate(emailAddress, [isNonEmptyString(), IsValidEmail()]).isValid;
const isCountryValid: OnboardingGuard = ({country}) => validate(country, [isNotNil()]).isValid;
const isPinCodeValid: OnboardingGuard = ({pinCode}) => validatePinCode(pinCode);
const doPinsMatch: OnboardingGuard = ({pinCode, verificationPinCode}) =>
  validatePinCode(pinCode) && validatePinCode(verificationPinCode) && pinCode === verificationPinCode;
const isSkipImport: OnboardingGuard = ({skipImport}) => !!skipImport;
const isImportData: OnboardingGuard = ({skipImport}) => !skipImport;
const hasFunkeRefreshUrl: OnboardingGuard = ({funkeProvider}) => funkeProvider?.refreshUrl !== undefined;

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
        {cond: OnboardingMachineGuards.isStepImportPersonalData, target: OnboardingMachineStateType.importPIDDataConsent},
        {cond: OnboardingMachineGuards.isStepComplete, target: OnboardingMachineStateType.completeOnboarding},
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
        {
          cond: ({currentStep, skipImport}) => currentStep === 4 && !skipImport,
          target: OnboardingMachineStateType.reviewPIDCredentials,
          actions: assign({currentStep: 3}),
        },
        {
          cond: ({currentStep, skipImport}) => currentStep === 4 && skipImport,
          target: OnboardingMachineStateType.importPIDDataConsent,
          actions: assign({currentStep: 3}),
        },
      ],
      SKIP_IMPORT: {
        target: OnboardingMachineStateType.setupWallet,
        actions: assign({skipImport: true}),
      },
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
      NEXT: [
        {
          cond: OnboardingMachineGuards.isBiometricsUndetermined,
          target: OnboardingMachineStateType.enableBiometrics,
        },
        {
          cond: OnboardingMachineGuards.isBiometricsDisabled,
          target: OnboardingMachineStateType.acceptTermsAndPrivacy,
        },
        {
          cond: OnboardingMachineGuards.isBiometricsEnabled,
          target: OnboardingMachineStateType.enableBiometrics,
        },
      ],
      PREVIOUS: OnboardingMachineStateType.enterPinCode,
      SET_BIOMETRICS: {actions: assign({biometricsEnabled: (_, event) => event.data})},
      SET_VERIFICATION_PIN_CODE: {actions: assign({verificationPinCode: (_, event) => event.data})},
    },
  },
  enableBiometrics: {
    on: {
      NEXT: {
        target: OnboardingMachineStateType.acceptTermsAndPrivacy,
        actions: assign({biometricsEnabled: OnboardingBiometricsStatus.ENABLED}),
      },
      PREVIOUS: OnboardingMachineStateType.enterPinCode,
      SKIP_BIOMETRICS: {
        target: OnboardingMachineStateType.acceptTermsAndPrivacy,
        actions: assign({biometricsEnabled: OnboardingBiometricsStatus.DISABLED}),
      },
    },
  },
  acceptTermsAndPrivacy: {
    on: {
      READ_TERMS: OnboardingMachineStateType.readTerms,
      READ_PRIVACY: OnboardingMachineStateType.readPrivacy,
      PREVIOUS: [
        {
          cond: OnboardingMachineGuards.isBiometricsEnabled,
          target: OnboardingMachineStateType.enableBiometrics,
        },
        {
          cond: OnboardingMachineGuards.isBiometricsDisabled,
          target: OnboardingMachineStateType.enterPinCode,
        },
      ],
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
  importPIDDataConsent: {
    on: {
      PREVIOUS: OnboardingMachineStateType.showProgress,
      NEXT: OnboardingMachineStateType.importPIDDataNFC,
      SKIP_IMPORT: {
        target: OnboardingMachineStateType.showProgress,
        actions: assign({currentStep: 4, skipImport: true}),
      },
    },
  },
  importPIDDataNFC: {
    on: {
      PREVIOUS: OnboardingMachineStateType.importPIDDataConsent,
      SET_FUNKE_PROVIDER: {actions: assign({funkeProvider: (_, event) => event.data})},
      NEXT: {cond: OnboardingMachineGuards.hasFunkeRefreshUrl, target: OnboardingMachineStateType.importPIDDataAuthentication},
    },
  },
  importPIDDataAuthentication: {
    on: {
      PREVIOUS: OnboardingMachineStateType.importPIDDataConsent,
      NEXT: OnboardingMachineStateType.retrievePIDCredentials,
    },
  },
  retrievePIDCredentials: {
    invoke: {
      src: OnboardingMachineServices.retrievePIDCredentials,
      onDone: {
        target: OnboardingMachineStateType.reviewPIDCredentials,
        actions: assign({pidCredentials: (_ctx: OnboardingMachineContext, _event: DoneInvokeEvent<Array<MappedCredential>>) => _event.data}),
      },
      onError: {
        target: OnboardingMachineStateType.handleError,
        actions: assign({
          error: (_ctx: OnboardingMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_machine_retrieve_credentials_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  reviewPIDCredentials: {
    on: {
      PREVIOUS: OnboardingMachineStateType.importPIDDataNFC,
      DECLINE_INFORMATION: {
        target: OnboardingMachineStateType.declinePIDCredentials,
        actions: assign({skipImport: true}),
      },
      NEXT: {
        target: OnboardingMachineStateType.storePIDCredentials,
      },
    },
  },
  declinePIDCredentials: {
    on: {
      PREVIOUS: OnboardingMachineStateType.reviewPIDCredentials,
      NEXT: {
        target: OnboardingMachineStateType.showProgress,
        actions: assign({currentStep: 4, skipImport: true}),
      },
    },
  },
  storePIDCredentials: {
    invoke: {
      src: OnboardingMachineServices.storePIDCredentials,
      onDone: {
        target: OnboardingMachineStateType.setupWallet,
      },
      onError: {
        target: OnboardingMachineStateType.handleError,
        actions: assign({
          error: (_ctx: OnboardingMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_machine_store_credential_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  setupWallet: {
    invoke: {
      src: OnboardingMachineServices.setupWallet,
      onDone: {
        target: OnboardingMachineStateType.completeOnboarding,
      },
      onError: {
        target: OnboardingMachineStateType.handleError,
        actions: assign({
          error: (_ctx: OnboardingMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_machine_store_credential_error_title'),
            message: _event.data.message,
          }),
        }),
      },
    },
  },
  completeOnboarding: {
    on: {
      PREVIOUS: [
        {
          cond: OnboardingMachineGuards.isSkipImport,
          target: OnboardingMachineStateType.showProgress,
          actions: assign({currentStep: 3}),
        },
        {
          cond: OnboardingMachineGuards.isImportData,
          target: OnboardingMachineStateType.reviewPIDCredentials,
        },
      ],
      NEXT: OnboardingMachineStateType.done,
    },
  },
  handleError: {
    on: {
      PREVIOUS: {
        target: OnboardingMachineStateType.error,
      },
      NEXT: {
        target: OnboardingMachineStateType.error,
      },
    },
  },
  error: {
    type: 'final',
    entry: assign({
      pinCode: '',
      name: undefined,
      emailAddress: undefined,
    }),
  },
  done: {
    type: 'final',
    entry: assign({
      pinCode: '',
      name: undefined,
      emailAddress: undefined,
    }),
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
    biometricsEnabled: OnboardingBiometricsStatus.INDETERMINATE,
    verificationPinCode: '',
    termsAndPrivacyAccepted: false,
    currentStep: 1,
    skipImport: false,
    pidCredentials: [],
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
          }
        | {
            type: OnboardingMachineGuards.hasFunkeRefreshUrl;
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
        services: {
          [OnboardingMachineServices.retrievePIDCredentials]: retrievePIDCredentials,
          [OnboardingMachineServices.storePIDCredentials]: storePIDCredentials,
          [OnboardingMachineServices.setupWallet]: setupWallet,
          ...opts?.services,
        },
        guards: {
          isStepCreateWallet,
          isStepSecureWallet,
          isStepComplete,
          isBiometricsEnabled,
          isBiometricsDisabled,
          isBiometricsUndetermined,
          isStepImportPersonalData,
          isNameValid,
          isEmailValid,
          isCountryValid,
          isPinCodeValid,
          doPinsMatch,
          isSkipImport,
          isImportData,
          hasFunkeRefreshUrl,
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
