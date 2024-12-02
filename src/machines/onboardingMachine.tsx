import {PartyCorrelationType} from '@sphereon/ssi-sdk.core';
import {CredentialDocumentFormat} from '@sphereon/ssi-sdk.data-store';
import {ActionType, CredentialMapper, DefaultActionSubType, DocumentFormat, InitiatorType, LogLevel, SubSystem, System} from '@sphereon/ssi-types';
import {computeEntryHash} from '@veramo/utils';
import Debug, {Debugger} from 'debug';
import {assign, createMachine, DoneInvokeEvent, GuardPredicate, interpret} from 'xstate';
import {APP_ID, PIN_CODE_LENGTH} from '../@config/constants';
import {translate} from '../localization/Localization';
import {onboardingStateNavigationListener} from '../navigation/machines/onboardingStateNavigation';
import {
  activateESim,
  retrievePIDCredentials,
  setupWallet,
  storeCredentialBranding,
  storePIDCredentials,
} from '../services/machines/onboardingMachineService';
import store from '../store';
import {storeActivityLogging} from '../store/actions/logging.actions';
import {ErrorDetails} from '../types';
import {MappedCredential} from '../types/machines/getPIDCredentialMachine';
import {
  CreateOnboardingMachineOpts,
  InstanceOnboardingMachineOpts,
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
  SetSecurityModel,
} from '../types/machines/onboarding';
import {isNonEmptyString, isNotNil, isNotSameDigits, isNotSequentialDigits, isStringOfLength, IsValidEmail, validate} from '../utils/validate';
import {PIDSecurityModel} from '../services/storageService';

const debug: Debugger = Debug(`${APP_ID}:onboarding`);

type OnboardingGuard = GuardPredicate<OnboardingMachineContext, OnboardingMachineEventTypes>['predicate'];

const isStepCreateWallet = (ctx: OnboardingMachineContext) => ctx.currentStep === OnboardingMachineStep.CREATE_WALLET;
const isStepSecureWallet = (ctx: OnboardingMachineContext) => ctx.currentStep === OnboardingMachineStep.SECURE_WALLET;
const isStepComplete: OnboardingGuard = ({currentStep}) => currentStep === OnboardingMachineStep.FINAL;
const isBiometricsEnabled = (ctx: OnboardingMachineContext) => {
  return ctx.biometricsEnabled === OnboardingBiometricsStatus.ENABLED;
};
const isBiometricsDisabled = (ctx: OnboardingMachineContext) => ctx.biometricsEnabled === OnboardingBiometricsStatus.DISABLED;
const isBiometricsUndetermined = (ctx: OnboardingMachineContext) => ctx.biometricsEnabled === OnboardingBiometricsStatus.INDETERMINATE;
const validatePinCode = (pinCode: string) =>
  validate(pinCode, [isStringOfLength(PIN_CODE_LENGTH)()]).isValid && validate(Number(pinCode), [isNotSameDigits(), isNotSequentialDigits()]).isValid;
const isStepImportPersonalData: OnboardingGuard = ({currentStep}) => currentStep === OnboardingMachineStep.IMPORT_PERSONAL_DATA;
const isNameValid: OnboardingGuard = ({name}) => validate(name, [isNonEmptyString()]).isValid;
const isEmailValid: OnboardingGuard = ({emailAddress}) => validate(emailAddress, [isNonEmptyString(), IsValidEmail()]).isValid;
const isCountryValid: OnboardingGuard = ({countryCode}) => validate(countryCode, [isNotNil()]).isValid;
const isPinCodeValid: OnboardingGuard = ({pinCode}) => validatePinCode(pinCode);
const doPinsMatch: OnboardingGuard = ({pinCode, verificationPinCode}) =>
  validatePinCode(pinCode) && validatePinCode(verificationPinCode) && pinCode === verificationPinCode;
const isSkipImport: OnboardingGuard = ({pidSecurityModel, countryCode, skipImport}) =>
  skipImport === true || 
  pidSecurityModel === PIDSecurityModel.EID_DURING_PRESENTATION ||
  countryCode !== 'DE'
const isImportData: OnboardingGuard = ({skipImport}) => !skipImport;
const hasFunkeRefreshUrl: OnboardingGuard = ({funkeProvider}) => funkeProvider?.refreshUrl !== undefined;
const isESimSecurity: OnboardingGuard = ({pidSecurityModel}) => {
  console.log('isESimSecurity check:', {pidSecurityModel, isESim: pidSecurityModel === PIDSecurityModel.MOBILE_OPERATOR_ESIM});
  return pidSecurityModel === PIDSecurityModel.MOBILE_OPERATOR_ESIM;
};

const isEidDuringPresentation: OnboardingGuard = ({pidSecurityModel}) =>
  pidSecurityModel === PIDSecurityModel.EID_DURING_PRESENTATION;

const isSecureElement: OnboardingGuard = ({pidSecurityModel}) =>
  pidSecurityModel === PIDSecurityModel.SECURE_ELEMENT;


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
        {
          cond: OnboardingMachineGuards.isStepImportPersonalData,
          target: OnboardingMachineStateType.importPIDDataConsent
        },
        {cond: OnboardingMachineGuards.isStepComplete, target: OnboardingMachineStateType.completeOnboarding}
      ],
      PREVIOUS: [
        {cond: OnboardingMachineGuards.isStepCreateWallet, target: OnboardingMachineStateType.showIntro},
        {
          cond: OnboardingMachineGuards.isStepSecureWallet,
          target: OnboardingMachineStateType.enterCountry,
          actions: assign({currentStep: OnboardingMachineStep.CREATE_WALLET})
        },
        {
          cond: ({currentStep}) => currentStep === OnboardingMachineStep.SETUP_SECURITY_MODEL,
          target: OnboardingMachineStateType.acceptTermsAndPrivacy,
          actions: assign({currentStep: OnboardingMachineStep.SECURE_WALLET})
        },
        {
          cond: ({currentStep, pidSecurityModel}) => 
            currentStep === OnboardingMachineStep.IMPORT_PERSONAL_DATA && 
            pidSecurityModel !== PIDSecurityModel.EID_DURING_PRESENTATION, // TODO move to guard
          target: OnboardingMachineStateType.reviewPIDCredentials,
          actions: assign({currentStep: OnboardingMachineStep.IMPORT_PERSONAL_DATA})
        }
      ],
      SET_POPUP_MENU_OPEN: {
        actions: assign({popupMenuOpen: (_, event) => event.data})
      },
      UPDATE_SECURITY_MODEL: {
        actions: assign({
          pidSecurityModel: (_, event: SetSecurityModel) => event.model,
        }),
      }
    }
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
        actions: assign({currentStep: OnboardingMachineStep.SECURE_WALLET}),
      },
      PREVIOUS: OnboardingMachineStateType.enterEmailAddress,
      SET_COUNTRY: {actions: assign({countryCode: (_, event) => event.data})},
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
      NEXT: [
        {
          cond: OnboardingMachineGuards.isSecureElement,
          target: OnboardingMachineStateType.importPIDDataConsent,
          actions: assign({currentStep: OnboardingMachineStep.IMPORT_PERSONAL_DATA})
        },
        {
          target: OnboardingMachineStateType.pidSecurityModelCheck,
          actions: assign({currentStep: OnboardingMachineStep.SECURE_WALLET})
        }
      ],
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
  pidSecurityModelCheck: {
    invoke: {
      src: () => Promise.resolve(),
      onDone: [
        {
          cond: OnboardingMachineGuards.isESimSecurity,
          target: OnboardingMachineStateType.activateESim,
          actions: assign({currentStep: OnboardingMachineStep.SETUP_SECURITY_MODEL}),
        },
        {
          cond: OnboardingMachineGuards.isEidDuringPresentation,
          target: OnboardingMachineStateType.setupWallet,
          actions: assign({currentStep: OnboardingMachineStep.FINAL}),
        },
        {
          target: OnboardingMachineStateType.importPIDDataConsent,
          actions: assign({currentStep: OnboardingMachineStep.IMPORT_PERSONAL_DATA}),
        },
      ],
    },
    on: {
      PREVIOUS: OnboardingMachineStateType.acceptTermsAndPrivacy,
    },
  },
  activateESim: {
    invoke: {
      src: OnboardingMachineServices.activateESim,
      onDone: {
        target: OnboardingMachineStateType.importPIDDataConsent,
        actions: assign({currentStep: OnboardingMachineStep.IMPORT_PERSONAL_DATA})
      },
      onError: {
        target: OnboardingMachineStateType.handleError,
        actions: assign({
          error: (_ctx: OnboardingMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_machine_activate_esim_error_title'),
            message: _event.data.message
          })
        })
      }
    }
  },
  importPIDDataConsent: {
    on: {
      PREVIOUS: OnboardingMachineStateType.showProgress,
      NEXT: [
        {
          cond: OnboardingMachineGuards.isEidDuringPresentation,
          target: OnboardingMachineStateType.showProgress,
          actions: assign({currentStep: OnboardingMachineStep.FINAL}),
        },
        {
          target: OnboardingMachineStateType.importPIDDataNFC,
        },
      ],
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
        target: OnboardingMachineStateType.setupWallet,
        actions: ['logDeclinePID', assign({currentStep: OnboardingMachineStep.FINAL, skipImport: true})],
      },
    },
  },
  storePIDCredentials: {
    invoke: {
      src: OnboardingMachineServices.storePIDCredentials,
      onDone: {
        target: OnboardingMachineStateType.storeCredentialBranding,
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
  storeCredentialBranding: {
    invoke: {
      src: OnboardingMachineServices.storeCredentialBranding,
      onDone: {
        target: OnboardingMachineStateType.setupWallet,
      },
      onError: {
        target: OnboardingMachineStateType.handleError,
        actions: assign({
          error: (_ctx: OnboardingMachineContext, _event: DoneInvokeEvent<Error>): ErrorDetails => ({
            title: translate('onboarding_store_credential_branding_error_title'),
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
          actions: assign({currentStep: OnboardingMachineStep.IMPORT_PERSONAL_DATA}),
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
  const initialContext: OnboardingMachineContext = {
    name: '',
    emailAddress: '',
    countryCode: 'DE',
    pinCode: '',
    biometricsEnabled: OnboardingBiometricsStatus.INDETERMINATE,
    verificationPinCode: '',
    termsAndPrivacyAccepted: false,
    pidSecurityModel: PIDSecurityModel.SECURE_ELEMENT,
    currentStep: 1,
    skipImport: false,
    pidCredentials: [],
    popupMenuOpen: false,
  };

  return createMachine<OnboardingMachineContext, OnboardingMachineEventTypes>(
    {
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
    },
    {
      actions: {
        logDeclinePID: async (context, event): Promise<void> => {
          let parentCredentialHash: string | undefined = undefined;
          context.pidCredentials.forEach(mappedCredential => {
            // FIXME function is not exposed in SSI-SDK, for now made a copy here
            function determineCredentialDocumentFormat(documentFormat: DocumentFormat): CredentialDocumentFormat {
              switch (documentFormat) {
                case DocumentFormat.JSONLD:
                  return CredentialDocumentFormat.JSON_LD;
                case DocumentFormat.JWT:
                  return CredentialDocumentFormat.JWT;
                case DocumentFormat.SD_JWT_VC:
                  return CredentialDocumentFormat.SD_JWT;
                case DocumentFormat.MSO_MDOC:
                  return CredentialDocumentFormat.MSO_MDOC;
                default:
                  throw new Error(`Not supported document format: ${documentFormat}`);
              }
            }

            const credentialHash = mappedCredential.uniformCredential.id ?? computeEntryHash(mappedCredential.rawCredential);

            store.dispatch<any>(
              storeActivityLogging({
                level: LogLevel.INFO,
                system: System.OID4VCI,
                subSystemType: SubSystem.VC_ISSUER,
                initiatorType: InitiatorType.SYSTEM,
                description: 'decline credential',
                actionType: ActionType.READ,
                actionSubType: DefaultActionSubType.VC_ISSUE_DECLINE,
                // @ts-ignore
                credentialType: determineCredentialDocumentFormat(CredentialMapper.detectDocumentType(mappedCredential.rawCredential)),
                parentCredentialHash,
                credentialHash,
                originalCredential: JSON.stringify(mappedCredential.rawCredential),
                partyCorrelationType: PartyCorrelationType.URL,
                partyCorrelationId: 'https://demo.pid-issuer.bundesdruckerei.de',
                partyAlias: 'Bundesdruckerei GmbH',
              }),
            );

            if (!parentCredentialHash) {
              parentCredentialHash = credentialHash;
            }
          });
        },
      },
    },
  );
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
          [OnboardingMachineServices.storeCredentialBranding]: storeCredentialBranding,
          [OnboardingMachineServices.setupWallet]: setupWallet,
          [OnboardingMachineServices.activateESim]: activateESim,
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
          isESimSecurity,
          isEidDuringPresentation,
          isSecureElement,
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
