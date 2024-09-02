import {ReactNode} from 'react';
import {
  BaseActionObject,
  GuardPredicate,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  State,
  StateMachine,
  StatesConfig,
  TypegenDisabled,
} from 'xstate';
import {DidAuthConfig, Party} from '@sphereon/ssi-sdk.data-store';
import {ManagedIdentifierOpts} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import VciServiceFunkeC2Provider from '../../providers/authentication/funke/VciServiceFunkeC2Provider';
import {ErrorDetails} from '../error';
import {MappedCredential} from './getPIDCredentialMachine';
import {SiopV2AuthorizationRequestData} from './siopV2';

export enum FunkeC2ShareMachineStateTypes {
  createConfig = 'createConfig',
  getSiopRequest = 'getSiopRequest',
  retrieveContact = 'retrieveContact',
  acceptRequestInformation = 'acceptRequestInformation',
  authenticateAusweisEID = 'authenticateAusweisEID',
  authenticate = 'authenticate',
  retrievePIDCredentials = 'retrievePIDCredentials',
  acceptShareCredential = 'acceptShareCredential',
  sendResponse = 'sendResponse',
  handleError = 'handleError',
  declined = 'declined',
  aborted = 'aborted',
  error = 'error',
  done = 'done',
}

export enum FunkeC2ShareMachineGuards {
  hasFunkeRefreshUrl = 'hasFunkeRefreshUrl',
}

export enum FunkeC2ShareMachineServices {
  createConfig = 'createConfig',
  getSiopRequest = 'getSiopRequest',
  retrieveContact = 'retrieveContact',
  retrievePIDCredentials = 'retrievePIDCredentials',
  sendResponse = 'sendResponse',
}

export enum FunkeC2ShareMachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  SET_FUNKE_PROVIDER = 'SET_FUNKE_PROVIDER',
}

export type NextEvent = {type: FunkeC2ShareMachineEvents.NEXT};
export type PreviousEvent = {type: FunkeC2ShareMachineEvents.PREVIOUS};
export type SetFunkeProvider = {type: FunkeC2ShareMachineEvents.SET_FUNKE_PROVIDER; data: VciServiceFunkeC2Provider};

export type FunkeC2ShareMachineEventTypes = NextEvent | PreviousEvent | SetFunkeProvider;

export type FunkeC2ShareMachineContext = {
  url: string;
  idOpts?: ManagedIdentifierOpts;
  funkeProvider?: VciServiceFunkeC2Provider;
  didAuthConfig?: Omit<DidAuthConfig, 'identifier'>;
  authorizationRequestData?: SiopV2AuthorizationRequestData;
  contact?: Party;
  pidCredentials: Array<MappedCredential>;
  error?: ErrorDetails;
};

export type FunkeC2ShareMachineStates = Record<FunkeC2ShareMachineStateTypes, {}>;

export type FunkeC2ShareMachineStatesStatesConfig = StatesConfig<
  FunkeC2ShareMachineContext,
  {
    states: FunkeC2ShareMachineStates;
  },
  FunkeC2ShareMachineEventTypes,
  any
>;

export type FunkeC2ShareMachineOpts = {
  url: string | URL;
  idOpts?: ManagedIdentifierOpts;
  machineId?: string;
};

export type FunkeC2ShareStateMachine = StateMachine<
  FunkeC2ShareMachineContext,
  any,
  FunkeC2ShareMachineEventTypes,
  {
    value: any;
    context: FunkeC2ShareMachineContext;
  },
  BaseActionObject,
  ServiceMap,
  ResolveTypegenMeta<TypegenDisabled, FunkeC2ShareMachineEventTypes, BaseActionObject, ServiceMap>
>;

export type FunkeC2ShareMachineInterpreter = Interpreter<
  FunkeC2ShareMachineContext,
  any,
  FunkeC2ShareMachineEventTypes,
  {
    value: any;
    context: FunkeC2ShareMachineContext;
  },
  any
>;

export type InstanceFunkeC2ShareMachineOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & FunkeC2ShareMachineOpts;

export type FunkeC2ShareMachineState = State<
  FunkeC2ShareMachineContext,
  FunkeC2ShareMachineEventTypes,
  any,
  {
    value: any;
    context: FunkeC2ShareMachineContext;
  },
  any
>;

export type FunkeC2ShareMachineGuard = GuardPredicate<FunkeC2ShareMachineContext, FunkeC2ShareMachineEventTypes>['predicate'];

export type FunkeC2ShareContextType = {
  funkeC2ShareInstance?: FunkeC2ShareMachineInterpreter;
};

export type FunkeC2ShareProviderProps = {
  children?: ReactNode;
  customFunkeC2ShareInstance?: FunkeC2ShareMachineInterpreter;
};
