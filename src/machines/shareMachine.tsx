import Debug, {Debugger} from 'debug';
import {GuardPredicate, InvokeCreator, assign, createMachine, interpret} from 'xstate';
import {APP_ID} from '../@config/constants';
import {shareStateNavigationListener} from '../navigation/machines/shareStateNavigation';
import {ToastTypeEnum} from '../types';
import {
  CreateShareMachineOpts,
  CredentialRequest,
  InstanceShareMachineOpts,
  ShareMachineContext,
  ShareMachineEvent,
  ShareMachineGuard,
  ShareMachineInterpreter,
  ShareMachineService,
  ShareMachineState,
  ShareMachineStateType,
  ShareStatesConfig,
} from '../types/machines/share';
import {showToast} from '../utils';

const debug: Debugger = Debug(`${APP_ID}:share`);
type ShareGuard = GuardPredicate<ShareMachineContext, ShareMachineEvent>['predicate'];
type ShareService<T> = InvokeCreator<ShareMachineContext, ShareMachineEvent, T>;

const getCredentialsRequest: ShareService<CredentialRequest> = ({qrPayload: _}) => {
  // Do some asynchronous request with the qrPayload
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        relyingParty: 'Gemeente Amsterdam',
        purpose: 'This is the optional purpose why the want your credentials',
        credentials: ['given_name', 'family_name'],
      });
    }, 2000);
  });
};

const shareCredentialsRequest: ShareService<never> = ({credentialsToShare: _}) => {
  // Do some asynchronous request with the credentails to share
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 2000);
  });
};

// TODO: Get from storage
const SAVED_PIN_CODE = '123123';

const isPinCodeValid: ShareGuard = ({verificationPinCode}) => verificationPinCode === SAVED_PIN_CODE;
const qrScannedSuccessfully: ShareGuard = ({qrError}) => !qrError;

const states: ShareStatesConfig = {
  scanQr: {
    on: {
      NEXT: {
        target: ShareMachineStateType.getCredentialsRequestLoading,
        cond: ShareMachineGuard.qrScannedSuccessfully,
      },
      SET_QR_PAYLOAD: {
        actions: [assign({qrError: false}), assign({qrPayload: (_, event) => event.data})],
      },
      SET_QR_ERROR: {
        actions: (_, event) => {
          showToast(ToastTypeEnum.TOAST_ERROR, {message: 'Unrecognized QR code'});
          assign({qrError: event.data});
        },
      },
    },
  },
  getCredentialsRequestLoading: {
    invoke: {
      src: ShareMachineService.getCredentialsRequest,
      onDone: {
        target: ShareMachineStateType.selectCredentials,
        actions: assign({credentialRequest: (_, {data}) => data}),
      },
      onError: {
        target: ShareMachineStateType.scanQr,
        actions: [assign({credentialRequest: undefined}), assign({getCredentialsRequestError: true})],
      },
    },
  },
  selectCredentials: {
    on: {
      NEXT: ShareMachineStateType.verifyPinCode,
      PREVIOUS: {
        target: ShareMachineStateType.scanQr,
        actions: assign({credentialRequest: undefined}),
      },
      SET_CREDENTIALS_TO_SHARE: {
        actions: assign({credentialsToShare: (_, event) => event.data}),
      },
    },
  },
  verifyPinCode: {
    on: {
      NEXT: ShareMachineStateType.shareCredentialsLoading,
      PREVIOUS: ShareMachineStateType.selectCredentials,
      SET_VERIFICATION_PIN_CODE: {actions: assign({verificationPinCode: (_, event) => event.data})},
    },
  },
  shareCredentialsLoading: {
    invoke: {
      src: ShareMachineService.shareCredentials,
      onDone: {
        target: ShareMachineStateType.credentialsShared,
      },
      onError: {
        target: ShareMachineStateType.credentialsShared,
        actions: assign({shareCredentialsError: true}),
      },
    },
  },
  credentialsShared: {},
};

const createShareMachine = (opts?: CreateShareMachineOpts) => {
  const initialContext: ShareMachineContext = {
    credentialRequest: undefined,
    qrError: false,
    getCredentialsRequestError: false,
    shareCredentialsError: false,
    verificationPinCode: SAVED_PIN_CODE,
    biometricsEnabled: false,
    credentialsToShare: [],
    qrPayload: undefined,
  };

  return createMachine<ShareMachineContext, ShareMachineEvent>({
    /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgAoBbAQwGMALASwzAEp8QAHLWKgFyqw0YA9EAjACZ0AT0FDkU5EA */
    id: 'Share',
    predictableActionArguments: true,
    initial: ShareMachineStateType.scanQr,
    context: initialContext,
    schema: {
      events: {} as ShareMachineEvent,
      guards: {} as
        | {
            type: ShareMachineGuard.isPinCodeValid;
          }
        | {
            type: ShareMachineGuard.qrScannedSuccessfully;
          },
      services: {} as {
        [ShareMachineService.getCredentialsRequest]: {
          data: CredentialRequest;
        };
      },
    },
    on: {
      RESET: {
        target: ShareMachineStateType.scanQr,
        actions: assign(initialContext),
      },
    },
    states: states,
  });
};

export class ShareMachine {
  private static _instance: ShareMachineInterpreter | undefined;

  static hasInstance(): boolean {
    return ShareMachine._instance !== undefined;
  }

  static get instance(): ShareMachineInterpreter {
    if (!ShareMachine._instance) {
      throw Error('Please initialize an share machine first');
    }
    return ShareMachine._instance;
  }

  static clearInstance(opts: {stop: boolean}) {
    const {stop} = opts;
    if (ShareMachine.hasInstance()) {
      if (stop) {
        this.stopInstance();
      }
    }
    ShareMachine._instance = undefined;
  }

  static stopInstance(): void {
    debug(`Stopping share instance...`);
    if (!ShareMachine.hasInstance()) {
      debug(`No share instance present to stop`);
      return;
    }
    ShareMachine.instance.stop();
    ShareMachine._instance = undefined;
    debug(`Stopped share instance`);
  }

  // todo: Determine whether we need to make this public for the share machine as there normally should only be 1
  private static newInstance(opts?: InstanceShareMachineOpts): ShareMachineInterpreter {
    debug(`Creating new share instance`, opts);
    const newInst: ShareMachineInterpreter = interpret(
      createShareMachine(opts)
        .withConfig({
          guards: {
            isPinCodeValid,
            qrScannedSuccessfully,
            ...opts?.guards,
          },
          services: {
            [ShareMachineService.getCredentialsRequest]: getCredentialsRequest,
            [ShareMachineService.shareCredentials]: shareCredentialsRequest,
            ...opts?.services,
          },
        })
        .withContext(createShareMachine(opts).context),
    );
    if (typeof opts?.subscription === 'function') {
      newInst.onTransition(opts.subscription);
    }
    if (opts?.requireCustomNavigationHook !== true) {
      debug(`Share machine hookup state navigation listener`, opts);
      newInst.onTransition((snapshot: ShareMachineState): void => {
        void shareStateNavigationListener(newInst, snapshot);
      });
    }
    debug(`New share instance created`, opts);
    return newInst;
  }

  static getInstance(
    opts?: InstanceShareMachineOpts & {
      requireExisting?: boolean;
    },
  ): ShareMachineInterpreter {
    if (!ShareMachine._instance) {
      if (opts?.requireExisting === true) {
        throw Error(`Existing share instance requested, but none was created at this point!`);
      }
      ShareMachine._instance = ShareMachine.newInstance(opts);
    }
    return ShareMachine._instance;
  }
}
