import {ReactNode} from 'react';
import {BaseActionObject, Interpreter, ResolveTypegenMeta, ServiceMap, State, StateMachine, TypegenDisabled} from 'xstate';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {IIdentifier} from '@veramo/core';
import {VerifiedAuthorizationRequest, PresentationDefinitionWithLocation, RPRegistrationMetadataPayload, URI} from '@sphereon/did-auth-siop';
import {DidAuthConfig, Party} from '@sphereon/ssi-sdk.data-store';
import {OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {ErrorDetails} from '../../error';
import {IQrData} from '../../qr';

export type SiopV2AuthorizationRequestData = {
  correlationId: string;
  registrationMetadataPayload: RPRegistrationMetadataPayload;
  issuer?: string;
  name?: string;
  uri?: URL;
  clientId?: string;
  presentationDefinitions?: PresentationDefinitionWithLocation[];
};

export type SiopV2MachineContext = {
  url: string;
  identifier?: IIdentifier;
  didAuthConfig?: Omit<DidAuthConfig, 'identifier'>;
  authorizationRequestData?: SiopV2AuthorizationRequestData;
  verifiedAuthorizationRequest?: VerifiedAuthorizationRequest;
  contact?: Party;
  hasContactConsent: boolean;
  contactAlias: string;
  selectedCredentials: Array<OriginalVerifiableCredential>;
  error?: ErrorDetails;
};

export enum SiopV2MachineStates {
  createConfig = 'createConfig',
  getSiopRequest = 'getSiopRequest',
  retrieveContact = 'retrieveContact',
  transitionFromSetup = 'transitionFromSetup',
  addContact = 'addContact',
  addContactIdentity = 'addContactIdentity',
  selectCredentials = 'selectCredentials',
  sendResponse = 'sendResponse',
  handleError = 'handleError',
  aborted = 'aborted',
  declined = 'declined',
  error = 'error',
  done = 'done',
}

export enum SiopV2MachineAddContactStates {
  idle = 'idle',
  next = 'next',
}

export type SiopV2MachineInterpreter = Interpreter<
  SiopV2MachineContext,
  any,
  SiopV2MachineEventTypes,
  {value: any; context: SiopV2MachineContext},
  any
>;

export type SiopV2MachineState = State<
  SiopV2MachineContext,
  SiopV2MachineEventTypes,
  any,
  {
    value: any;
    context: SiopV2MachineContext;
  },
  any
>;

export type SiopV2StateMachine = StateMachine<
  SiopV2MachineContext,
  any,
  SiopV2MachineEventTypes,
  {value: any; context: SiopV2MachineContext},
  BaseActionObject,
  ServiceMap,
  ResolveTypegenMeta<TypegenDisabled, SiopV2MachineEventTypes, BaseActionObject, ServiceMap>
>;

export type CreateSiopV2MachineOpts = {
  url: string | URL;
  machineId?: string;
};

export type SiopV2MachineInstanceOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & CreateSiopV2MachineOpts;

export type SiopV2ProviderProps = {
  children?: ReactNode;
  customSiopV2Instance?: SiopV2MachineInterpreter;
};

export type SiopV2Context = {
  siopV2Instance?: SiopV2MachineInterpreter;
};

export type SiopV2MachineNavigationArgs = {
  siopV2Machine: SiopV2MachineInterpreter;
  state: SiopV2MachineState;
  navigation: NativeStackNavigationProp<any>;
  onNext?: () => void;
  onBack?: () => void;
};

export enum SiopV2MachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  DECLINE = 'DECLINE',
  SET_CONTACT_ALIAS = 'SET_CONTACT_ALIAS',
  SET_CONTACT_CONSENT = 'SET_CONTACT_CONSENT',
  CREATE_CONTACT = 'CREATE_CONTACT',
  SET_SELECTED_CREDENTIALS = 'SET_SELECTED_CREDENTIALS',
}

export enum SiopV2MachineGuards {
  hasNoContactGuard = 'siopV2HasNoContactGuard',
  createContactGuard = 'siopV2CreateContactGuard',
  hasContactGuard = 'siopV2HasContactGuard',
  hasSelectedRequiredCredentialsGuard = 'siopV2HasSelectedRequiredCredentialsGuard',
  siopOnlyGuard = 'siopV2IsSiopOnlyGuard',
  siopWithOID4VPGuard = 'siopV2IsSiopWithOID4VPGuard',
}

export enum SiopV2MachineServices {
  getSiopRequest = 'getSiopRequest',
  retrieveContact = 'retrieveContact',
  addContactIdentity = 'addContactIdentity',
  sendResponse = 'sendResponse',
  createConfig = 'createConfig',
}

export type NextEvent = {type: SiopV2MachineEvents.NEXT};
export type PreviousEvent = {type: SiopV2MachineEvents.PREVIOUS};
export type DeclineEvent = {type: SiopV2MachineEvents.DECLINE};
export type ContactConsentEvent = {type: SiopV2MachineEvents.SET_CONTACT_CONSENT; data: boolean};
export type ContactAliasEvent = {type: SiopV2MachineEvents.SET_CONTACT_ALIAS; data: string};
export type CreateContactEvent = {type: SiopV2MachineEvents.CREATE_CONTACT; data: Party};
export type SelectCredentialsEvent = {
  type: SiopV2MachineEvents.SET_SELECTED_CREDENTIALS;
  data: Array<OriginalVerifiableCredential>;
};

export type SiopV2MachineEventTypes =
  | NextEvent
  | PreviousEvent
  | DeclineEvent
  | CreateContactEvent
  | ContactConsentEvent
  | ContactAliasEvent
  | SelectCredentialsEvent;
