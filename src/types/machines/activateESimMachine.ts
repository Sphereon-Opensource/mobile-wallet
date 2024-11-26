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
import {SscdInfo} from '@sphereon/musap-react-native';
import {ReactNode} from 'react';
import {storageDeleteCoupledWithCode} from '../../services/storageService';

export type CreateESIMActivationMachineOpts = {
  machineId?: string;
};

export type ESIMActivationMachineContext = {
  checkMustEnableLink?: boolean;
  musapLinkIdCreatedNow?: boolean;
  musapLinkId?: string;
  msisdn?: string;
  couplingCode?: string;
  coupledWithCode?: string;
  sscdInfo?: SscdInfo;
  error?: Error;
};

export type ESIMActivationMachineState = State<
  ESIMActivationMachineContext,
  ESIMActivationMachineEventTypes,
  any,
  {
    value: any;
    context: ESIMActivationMachineContext;
  },
  any
>;

export type ESIMActivationStateMachine = StateMachine<
  ESIMActivationMachineContext,
  any,
  ESIMActivationMachineEventTypes,
  {
    value: any;
    context: ESIMActivationMachineContext;
  },
  BaseActionObject,
  ServiceMap,
  ResolveTypegenMeta<TypegenDisabled, ESIMActivationMachineEventTypes, BaseActionObject, ServiceMap>
>;

export type ESIMActivationMachineInterpreter = Interpreter<
  ESIMActivationMachineContext,
  any,
  ESIMActivationMachineEventTypes,
  {
    value: any;
    context: ESIMActivationMachineContext;
  },
  any
>;

export enum ESIMActivationMachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  SET_MSISDN = 'SET_MSISDN',
  SET_COUPLING_CODE = 'SET_COUPLING_CODE',
}

export type NextEvent = {type: ESIMActivationMachineEvents.NEXT};
export type PreviousEvent = {type: ESIMActivationMachineEvents.PREVIOUS};
export type SetMsisdnEvent = {type: ESIMActivationMachineEvents.SET_MSISDN; msisdn: string};
export type SetCouplingCodeEvent = {type: ESIMActivationMachineEvents.SET_COUPLING_CODE; couplingCode: string};

export type ESIMActivationMachineEventTypes = NextEvent | PreviousEvent | SetMsisdnEvent | SetCouplingCodeEvent;

export enum ESIMActivationMachineGuards {
  hasValidDetails = 'hasValidDetails',
  needsKeyCleanup = 'needsKeyCleanup',
}

export enum ESIMActivationMachineServices {
  checkMustEnableLink = 'checkMustEnableLink',
  createMusapLink = 'createMusapLink',
  checkSscd = 'checkSscd',
  enableSscd = 'enableSscd',
  cleanupKeys = 'cleanupKeys',
  loadCoupledWithCode = 'loadCoupledWithCode',
  storageDeleteCoupledWithCode = 'storageDeleteCoupledWithCode',
  getCoupledWithCode = 'getCoupledWithCode',
  coupleWithRP = 'coupleWithRP',
  bindKey = 'bindKey',
}

export enum ESIMActivationMachineStateTypes {
  init = 'init',
  createMusapLink = 'createMusapLink',
  checkSscd = 'checkSscd',
  enableSscd = 'enableSscd',
  cleanupKeys = 'cleanupKeys',
  loadCoupledWithCode = 'loadCoupledWithCode',
  enterDetails = 'enterDetails',
  coupleWithRP = 'coupleWithRP',
  bindKey = 'bindKey',
  handleError = 'handleError',
  error = 'error',
  success = 'success',
}

export type ESIMActivationMachineStates = Record<ESIMActivationMachineStateTypes, {}>;

export type ESIMActivationMachineStatesConfig = StatesConfig<
  ESIMActivationMachineContext,
  {
    states: ESIMActivationMachineStates;
  },
  ESIMActivationMachineEventTypes,
  any
>;

export type ESIMActivationMachineGuard = GuardPredicate<ESIMActivationMachineContext, ESIMActivationMachineEventTypes>['predicate'];

export type InstanceESIMActivationMachineOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & CreateESIMActivationMachineOpts;

export type ESIMActivationProviderProps = {
  children?: ReactNode;
  customESIMActivationInstance?: ESIMActivationMachineInterpreter;
};
