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
import VciServiceFunkeCProvider from '../../providers/authentication/funke/VciServiceFunkeCProvider';
import {ErrorDetails} from '../error';
import {MappedCredential} from './getPIDCredentialMachine';
import {PresentationDefinitionWithLocation, RPRegistrationMetadataPayload} from '@sphereon/did-auth-siop';
import {DcqlQuery} from 'dcql';

export enum FunkeC2ShareMachineStateTypes {
  createConfig = 'createConfig',
  getSiopRequest = 'getSiopRequest',
  retrieveContact = 'retrieveContact',
  acceptRequestInformation = 'acceptRequestInformation',
  authenticateAusweisEID = 'authenticateAusweisEID',
  authenticate = 'authenticate',
  retrievePIDCredentials = 'retrievePIDCredentials',
  acceptShareCredential = 'acceptShareCredential',
  storePIDCredentials = 'storePIDCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  sendResponse = 'sendResponse',
  fetchCredentialsInStore = 'fetchCredentialsInStore',
  getFederationTrust = 'getFederationTrust',
  transitionFromSetup = 'transitionFromSetup',
  addContact = 'addContact',
  reviewContact = 'reviewContact',
  handleError = 'handleError',
  declined = 'declined',
  aborted = 'aborted',
  error = 'error',
  done = 'done',
}

export enum FunkeC2ShareMachineGuards {
  hasFunkeRefreshUrl = 'hasFunkeRefreshUrl',
  createContactGuard = 'funkeC2CreateContactGuard',
  hasContactGuard = 'funkeC2HasContactGuard',
  hasNoContactGuard = 'funkeC2HasNoContactGuard',
  contactHasLowTrustGuard = 'funkeC2ContactHasLowTrustGuard',
  isOIDFOriginGuard = 'funkeC2IsOIDFOriginGuard',
}

export enum FunkeC2ShareMachineServices {
  createConfig = 'createConfig',
  getSiopRequest = 'getSiopRequest',
  retrieveContact = 'retrieveContact',
  retrievePIDCredentials = 'retrievePIDCredentials',
  sendResponse = 'sendResponse',
  storePIDCredentials = 'storePIDCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  fetchCredentialsInStore = 'fetchCredentialsInStore',
  getFederationTrust = 'getFederationTrust',
}

export enum FunkeC2ShareMachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  SET_FUNKE_PROVIDER = 'SET_FUNKE_PROVIDER',
  DECLINE = 'DECLINE',
  SET_CONTACT_ALIAS = 'SET_CONTACT_ALIAS',
  // SET_CONTACT_CONSENT = 'SET_CONTACT_CONSENT',
  CREATE_CONTACT = 'CREATE_CONTACT',
}

export type NextEvent = {type: FunkeC2ShareMachineEvents.NEXT};
export type PreviousEvent = {type: FunkeC2ShareMachineEvents.PREVIOUS};
export type SetFunkeProvider = {type: FunkeC2ShareMachineEvents.SET_FUNKE_PROVIDER; data: VciServiceFunkeCProvider};
export type DeclineEvent = {type: FunkeC2ShareMachineEvents.DECLINE};
export type ContactAliasEvent = {type: FunkeC2ShareMachineEvents.SET_CONTACT_ALIAS; data: string};
export type CreateContactEvent = {type: FunkeC2ShareMachineEvents.CREATE_CONTACT; data: Party};

export type FunkeC2ShareMachineEventTypes = NextEvent | PreviousEvent | SetFunkeProvider | DeclineEvent | ContactAliasEvent | CreateContactEvent;

export type FunkeC2ShareMachineContext = {
  url: string;
  idOpts?: ManagedIdentifierOpts;
  funkeProvider?: VciServiceFunkeCProvider;
  didAuthConfig?: Omit<DidAuthConfig, 'identifier'>;
  authorizationRequestData?: SiopV2AuthorizationRequestData;
  contact?: Party;
  pidCredentials: Array<MappedCredential>;
  error?: ErrorDetails;
  contactAlias: string;
  trustAnchors: Array<string>;
  trustedAnchors?: Array<string>;
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
  trustAnchors?: Array<string>;
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

export enum FunkeC2ShareMachineAddContactStates {
  idle = 'idle',
  next = 'next',
}

export type SiopV2AuthorizationRequestData = {
  correlationId: string;
  registrationMetadataPayload: RPRegistrationMetadataPayload;
  issuer?: string;
  name?: string;
  uri?: URL;
  clientId?: string;
  presentationDefinitions?: PresentationDefinitionWithLocation[];
  dcql?: DcqlQuery
};
