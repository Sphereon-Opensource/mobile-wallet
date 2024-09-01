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
import {
  CreateGetPIDCredentialsMachineOpts,
  GetPIDCredentialsMachineContext,
  GetPIDCredentialsMachineEvents,
  GetPIDCredentialsMachineEventTypes,
  MappedCredential,
} from './getPIDCredentialMachine';
import VciServiceFunkeCProvider from '../../providers/authentication/funke/VciServiceFunkeCProvider';
import {DidAuthConfig, Party} from '@sphereon/ssi-sdk.data-store';
import {ErrorDetails} from '../error';
import {SiopV2AuthorizationRequestData} from './siopV2';

export enum FunkeCShareMachineStateTypes {
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

export enum FunkeCShareMachineGuards {
  hasFunkeRefreshUrl = 'hasFunkeRefreshUrl',
}

export enum FunkeCShareMachineServices {}

export enum FunkeCShareMachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  SET_FUNKE_PROVIDER = 'SET_FUNKE_PROVIDER',
}

export type NextEvent = {type: FunkeCShareMachineEvents.NEXT};
export type PreviousEvent = {type: FunkeCShareMachineEvents.PREVIOUS};
export type SetFunkeProvider = {type: GetPIDCredentialsMachineEvents.SET_FUNKE_PROVIDER; data: VciServiceFunkeCProvider};

export type FunkeCShareMachineEventTypes = NextEvent | PreviousEvent | SetFunkeProvider;

export type FunkeCShareMachineContext = {
  funkeProvider?: VciServiceFunkeCProvider;
  didAuthConfig?: Omit<DidAuthConfig, 'identifier'>;
  authorizationRequestData?: SiopV2AuthorizationRequestData;
  contact?: Party;
  pidCredentials: Array<MappedCredential>;
  error?: ErrorDetails;
};

export type FunkeCShareMachineStates = Record<FunkeCShareMachineStateTypes, {}>;

export type FunkeCShareMachineStatesStatesConfig = StatesConfig<
  FunkeCShareMachineContext,
  {
    states: FunkeCShareMachineStates;
  },
  FunkeCShareMachineEventTypes,
  any
>;

export type FunkeCShareMachineOpts = {
  machineId?: string;
};

export type FunkeCShareStateMachine = StateMachine<
  FunkeCShareMachineContext,
  any,
  FunkeCShareMachineEventTypes,
  {
    value: any;
    context: FunkeCShareMachineContext;
  },
  BaseActionObject,
  ServiceMap,
  ResolveTypegenMeta<TypegenDisabled, FunkeCShareMachineEventTypes, BaseActionObject, ServiceMap>
>;

export type FunkeCShareMachineInterpreter = Interpreter<
  FunkeCShareMachineContext,
  any,
  FunkeCShareMachineEventTypes,
  {
    value: any;
    context: FunkeCShareMachineContext;
  },
  any
>;

export type InstanceFunkeCShareMachineOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & FunkeCShareMachineOpts;

export type FunkeCShareMachineState = State<
  FunkeCShareMachineContext,
  FunkeCShareMachineEventTypes,
  any,
  {
    value: any;
    context: FunkeCShareMachineContext;
  },
  any
>;

export type FunkeCShareMachineGuard = GuardPredicate<FunkeCShareMachineContext, FunkeCShareMachineEventTypes>['predicate'];
