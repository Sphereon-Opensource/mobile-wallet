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
import VciServiceFunkeC2Provider from '../../providers/authentication/funke/VciServiceFunkeC2Provider';
import VciServiceFunkeCProvider from '../../providers/authentication/funke/VciServiceFunkeCProvider';
import {ErrorDetails} from '../error';
import {IVerifiableCredential} from '@sphereon/ssi-types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {GetPIDCredentialsStackParamsList} from '../navigation';
import {ReactNode} from 'react';
import {ManagedIdentifierResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';

export type CreateGetPIDCredentialsMachineOpts = {
  machineId?: string;
};

export type GetPIDCredentialsMachineContext = {
  funkeProvider?: VciServiceFunkeCProvider | VciServiceFunkeC2Provider;
  pidCredentials: Array<MappedCredential>;
  error?: ErrorDetails;
};

export type GetPIDCredentialsMachineState = State<
  GetPIDCredentialsMachineContext,
  GetPIDCredentialsMachineEventTypes,
  any,
  {
    value: any;
    context: GetPIDCredentialsMachineContext;
  },
  any
>;

export type GetPIDCredentialsStateMachine = StateMachine<
  GetPIDCredentialsMachineContext,
  any,
  GetPIDCredentialsMachineEventTypes,
  {
    value: any;
    context: GetPIDCredentialsMachineContext;
  },
  BaseActionObject,
  ServiceMap,
  ResolveTypegenMeta<TypegenDisabled, GetPIDCredentialsMachineEventTypes, BaseActionObject, ServiceMap>
>;

export type GetPIDCredentialsMachineInterpreter = Interpreter<
  GetPIDCredentialsMachineContext,
  any,
  GetPIDCredentialsMachineEventTypes,
  {
    value: any;
    context: GetPIDCredentialsMachineContext;
  },
  any
>;

export enum GetPIDCredentialsMachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  DECLINE_INFORMATION = 'DECLINE_INFORMATION',
  SET_FUNKE_PROVIDER = 'SET_FUNKE_PROVIDER',
}

export type NextEvent = {type: GetPIDCredentialsMachineEvents.NEXT};
export type PreviousEvent = {type: GetPIDCredentialsMachineEvents.PREVIOUS};
export type DeclineInformation = {type: GetPIDCredentialsMachineEvents.DECLINE_INFORMATION};
export type SetFunkeProvider = {type: GetPIDCredentialsMachineEvents.SET_FUNKE_PROVIDER; data: VciServiceFunkeCProvider};

export type GetPIDCredentialsMachineEventTypes = NextEvent | PreviousEvent | DeclineInformation | SetFunkeProvider;

export enum GetPIDCredentialsMachineGuards {
  hasFunkeRefreshUrl = 'hasFunkeRefreshUrl',
}

export enum GetPIDCredentialsMachineServices {
  retrievePIDCredentials = 'retrievePIDCredentials',
  storePIDCredentials = 'storePIDCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  fetchCredentialsInStore = 'fetchCredentialsInStore',
}

export enum GetPIDCredentialsMachineStateTypes {
  consentToAddPIDCredentials = 'consentToAddPIDCredentials',
  authenticateAusweisEID = 'authenticateAusweisEID',
  authenticate = 'authenticate',
  retrievePIDCredentials = 'retrievePIDCredentials',
  reviewPIDCredentials = 'reviewPIDCredentials',
  declinePIDCredentials = 'declinePIDCredentials',
  storePIDCredentials = 'storePIDCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  fetchCredentialsInStore = 'fetchCredentialsInStore',
  handleError = 'handleError',
  aborted = 'aborted',
  declined = 'declined',
  error = 'error',
  done = 'done',
}

export type GetPIDCredentialsMachineStates = Record<GetPIDCredentialsMachineStateTypes, {}>;

export type GetPIDCredentialsMachineStatesConfig = StatesConfig<
  GetPIDCredentialsMachineContext,
  {
    states: GetPIDCredentialsMachineStates;
  },
  GetPIDCredentialsMachineEventTypes,
  any
>;

export type GetPIDCredentialsMachineGuard = GuardPredicate<GetPIDCredentialsMachineContext, GetPIDCredentialsMachineEventTypes>['predicate'];

export type MappedCredential = {
  uniformCredential: IVerifiableCredential;
  rawCredential: string;
  identifier?: ManagedIdentifierResult;
};

export type GetPIDCredentialsContextType = {
  getPIDCredentialsInstance: GetPIDCredentialsMachineInterpreter;
};

export type GetPIDCredentialsMachineNavigationArgs = {
  navigation: NativeStackNavigationProp<GetPIDCredentialsStackParamsList>;
  context: GetPIDCredentialsMachineContext;
};

export type GetPIDCredentialsProviderProps = {
  children?: ReactNode;
  customGetPIDCredentialsInstance?: GetPIDCredentialsMachineInterpreter;
};

export type InstanceGetPIDCredentialsMachineOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & CreateGetPIDCredentialsMachineOpts;
