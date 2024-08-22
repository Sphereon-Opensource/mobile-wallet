import {NavigationHelpers} from '@react-navigation/native';
import {ReactNode} from 'react';
import {Interpreter, State, StatesConfig} from 'xstate';
import {StackParamList} from '../../../types/navigation';

export type DataPoint = {
  label: string;
  value: string;
};

// Replace with type or generic
export type UsefulQrPayload = {
  url: string | URL;
};

export type CredentialRequest = {
  relyingParty: string;
  credentials: string[];
  purpose?: string;
  uri?: string;
};

export type ShareMachineContext = {
  credentialRequest?: CredentialRequest;
  credentialsToShare: DataPoint[];
  qrPayload?: UsefulQrPayload;
  qrError: boolean;
  getCredentialsRequestError: boolean;
  shareCredentialsError: boolean;
  verificationPinCode: string;
  biometricsEnabled: boolean;
};

// States
export enum ShareMachineStateType {
  scanQr = 'scanQr',
  getCredentialsRequestLoading = 'getCredentialsRequestLoading',
  selectCredentials = 'selectCredentials',
  shareCredentialsLoading = 'shareCredentialsLoading',
  verifyPinCode = 'verifyPinCode',
  credentialsShared = 'credentialsShared',
}

export type ShareMachineStates = Record<ShareMachineStateType, {}>;

// Events
export enum ShareMachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  RESET = 'RESET',
  SET_QR_PAYLOAD = 'SET_QR_PAYLOAD',
  SET_VERIFICATION_PIN_CODE = 'SET_VERIFICATION_PIN_CODE',
  SET_QR_ERROR = 'SET_QR_ERROR',
  SET_CREDENTIAL_REQUEST = 'SET_CREDENTIAL_REQUEST',
  // op name
  SET_GET_CREDENTIALS_REQUEST_ERROR = 'SET_GET_CREDENTIALS_REQUEST_ERROR',
  SET_CREDENTIALS_SHARED_ERROR = 'SET_CREDENTIALS_SHARED_ERROR',
  SET_CREDENTIALS_TO_SHARE = 'SET_CREDENTIALS_TO_SHARE',
}

export type NextEvent = {type: ShareMachineEvents.NEXT};
export type PreviousEvent = {type: ShareMachineEvents.PREVIOUS};
export type ResetEvent = {type: ShareMachineEvents.RESET};
export type SetQrPayloadEvent = {type: ShareMachineEvents.SET_QR_PAYLOAD; data: UsefulQrPayload};
export type SetVerificationPinCodeEvent = {type: ShareMachineEvents.SET_VERIFICATION_PIN_CODE; data: string};
export type SetCredentialsToShareEvent = {type: ShareMachineEvents.SET_CREDENTIALS_TO_SHARE; data: DataPoint[]};
export type SetQrErrorEvent = {type: ShareMachineEvents.SET_QR_ERROR; data: boolean};
export type SetCredentialRequestEvent = {type: ShareMachineEvents.SET_CREDENTIAL_REQUEST; data?: CredentialRequest};
export type SetCredentialsSharedErrorEvent = {type: ShareMachineEvents.SET_CREDENTIALS_SHARED_ERROR; data: boolean};
// op name
export type SetGetCredentialsRequestErrorEvent = {type: ShareMachineEvents.SET_GET_CREDENTIALS_REQUEST_ERROR; data: boolean};

export type ShareMachineEvent =
  | NextEvent
  | PreviousEvent
  | ResetEvent
  | SetQrPayloadEvent
  | SetVerificationPinCodeEvent
  | SetCredentialRequestEvent
  | SetQrErrorEvent
  | SetCredentialsToShareEvent
  // op name
  | SetGetCredentialsRequestErrorEvent
  | SetCredentialsSharedErrorEvent;

// Actions
export enum ShareMachineActions {
  SET_QR_ERROR = 'SET_QR_ERROR',
  SET_CREDENTIAL_REQUEST = 'SET_CREDENTIAL_REQUEST',
  SET_GET_CREDENTIALS_REQUEST_ERROR = 'SET_GET_CREDENTIALS_REQUEST_ERROR',
  SET_CREDENTIALS_SHARED_ERROR = 'SET_CREDENTIALS_SHARED_ERROR',
}

export type SetQrErrorAction = {type: ShareMachineActions.SET_QR_ERROR; data: boolean};
export type SetCredentialRequestAction = {type: ShareMachineActions.SET_CREDENTIAL_REQUEST};
export type SetGetCredentialsRequestErrorAction = {type: ShareMachineActions.SET_GET_CREDENTIALS_REQUEST_ERROR};
export type SetCredentialsSharedErrorAction = {type: ShareMachineActions.SET_CREDENTIALS_SHARED_ERROR};

export type ShareMachineAction =
  | SetQrErrorAction
  | SetCredentialRequestAction
  | SetGetCredentialsRequestErrorAction
  | SetCredentialsSharedErrorAction;

// Guards
export enum ShareMachineGuard {
  isPinCodeValid = 'isPinCodeValid',
  qrScannedSuccessfully = 'qrScannedSuccessfully',
}

// Services
export enum ShareMachineService {
  getCredentialsRequest = 'getCredentialsRequest',
  shareCredentials = 'shareCredentials',
}

// States Config
export type ShareStatesConfig = StatesConfig<ShareMachineContext, {states: ShareMachineStates}, ShareMachineEvent, any>;

// We use this in class components, as there is no context available there. It is also used by default in the Share provider

export type ShareMachineInterpreter = Interpreter<
  ShareMachineContext,
  {states: ShareMachineStates},
  ShareMachineEvent,
  {
    value: any;
    context: ShareMachineContext;
  },
  any
>;

export type ShareContext = {
  shareInstance: ShareMachineInterpreter;
};

export type CreateShareMachineOpts = {
  machineId?: string;
};

export type InstanceShareMachineOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & CreateShareMachineOpts;

export type ShareMachineState = State<
  ShareMachineContext,
  ShareMachineEvent,
  {states: ShareMachineStates},
  {value: any; context: ShareMachineContext},
  any
>;

export type ShareMachineNavigationArgs = {
  navigation: NavigationHelpers<StackParamList>;
  context: ShareMachineContext;
};

export type ShareProviderProps = {
  children?: ReactNode;
  customShareInstance?: ShareMachineInterpreter;
};
