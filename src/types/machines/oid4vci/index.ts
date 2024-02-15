import {AuthorizationResponse} from '@sphereon/oid4vci-common';
import {ReactNode} from 'react';
import {BaseActionObject, Interpreter, ResolveTypegenMeta, ServiceMap, State, StateMachine, TypegenDisabled} from 'xstate';
import {VerifiableCredential} from '@veramo/core';
import {Party} from '@sphereon/ssi-sdk.data-store';
import {IVerifiableCredential} from '@sphereon/ssi-types';
import OpenId4VcIssuanceProvider, {CredentialToAccept} from '../../../providers/credential/OpenId4VcIssuanceProvider';
import {ErrorDetails} from '../../error';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {IQrData} from '../../qr';
import {ICredentialTypeSelection} from '../../credential';

export type MappedCredentialToAccept = {
  correlationId: string;
  credential: CredentialToAccept;
  transactionId?: string;
  uniformVerifiableCredential?: IVerifiableCredential;
  rawVerifiableCredential?: VerifiableCredential;
};

export type OID4VCIMachineContext = {
  requestData?: IQrData; // TODO WAL-673 fix type as this is not always a qr code (deeplink)
  credentialSelection: Array<ICredentialTypeSelection>;
  contactAlias: string;
  contact?: Party;
  selectedCredentials: Array<string>;
  credentialsToAccept: Array<MappedCredentialToAccept>;
  authorizationCodeURL?: string;
  authorizationCodeResponse?: AuthorizationResponse;
  // TODO WAL-672 refactor to not store verificationCode in the context
  verificationCode?: string;
  hasContactConsent: boolean;
  error?: ErrorDetails;
  openId4VcIssuanceProvider?: OpenId4VcIssuanceProvider;
};

export enum OID4VCIMachineStates {
  initiateOID4VCIProvider = 'initiateOID4VCIProvider',
  createCredentialSelection = 'createCredentialSelection',
  retrieveContact = 'retrieveContact',
  transitionFromSetup = 'transitionFromSetup',
  addContact = 'addContact',
  transitionFromContactSetup = 'transitionFromContactSetup',
  selectCredentials = 'selectCredentials',
  transitionFromSelectingCredentials = 'transitionFromSelectingCredentials',
  verifyPin = 'verifyPin',
  initiateAuthorizationRequest = 'initiateAuthorizationRequest',
  waitForAuthorizationResponse = 'waitForAuthorizationResponse',
  retrieveCredentials = 'retrieveCredentials',
  transitionFromWalletInput = 'transitionFromWalletInput',
  addContactIdentity = 'addContactIdentity',
  reviewCredentials = 'reviewCredentials',
  verifyCredentials = 'verifyCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  storeCredentials = 'storeCredentials',
  handleError = 'handleError',
  aborted = 'aborted',
  declined = 'declined',
  error = 'error',
  done = 'done',
}

export enum OID4VCIMachineAddContactStates {
  idle = 'idle',
  next = 'next',
}

export enum OID4VCIMachineVerifyPinStates {
  idle = 'idle',
  next = 'next',
}

export type OID4VCIMachineInterpreter = Interpreter<
  OID4VCIMachineContext,
  any,
  OID4VCIMachineEventTypes,
  {value: any; context: OID4VCIMachineContext},
  any
>;

export type OID4VCIMachineState = State<OID4VCIMachineContext, OID4VCIMachineEventTypes, any, {value: any; context: OID4VCIMachineContext}, any>;

export type OID4VCIStateMachine = StateMachine<
  OID4VCIMachineContext,
  any,
  OID4VCIMachineEventTypes,
  {value: any; context: OID4VCIMachineContext},
  BaseActionObject,
  ServiceMap,
  ResolveTypegenMeta<TypegenDisabled, OID4VCIMachineEventTypes, BaseActionObject, ServiceMap>
>;

export type CreateOID4VCIMachineOpts = {
  requestData: IQrData;
  machineId?: string;
};

export type OID4VCIMachineInstanceOpts = {
  services?: any;
  guards?: any;
  subscription?: () => void;
  requireCustomNavigationHook?: boolean;
} & CreateOID4VCIMachineOpts;

export type OID4VCIProviderProps = {
  children?: ReactNode;
  customOID4VCIInstance?: OID4VCIMachineInterpreter;
};

export type OID4VCIContext = {
  oid4vciInstance?: OID4VCIMachineInterpreter;
};

export type OID4VCIMachineNavigationArgs2 = {
  oid4vciMachine: OID4VCIMachineInterpreter;
  state: OID4VCIMachineState;
  navigation: NativeStackNavigationProp<any>;
  onNext?: () => void;
  onBack?: () => void;
};

export enum OID4VCIMachineEvents {
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS',
  DECLINE = 'DECLINE',
  CREATE_CONTACT = 'CREATE_CONTACT',
  SET_VERIFICATION_CODE = 'SET_VERIFICATION_CODE',
  SET_CONTACT_ALIAS = 'SET_CONTACT_ALIAS',
  SET_CONTACT_CONSENT = 'SET_CONTACT_CONSENT',
  SET_SELECTED_CREDENTIALS = 'SET_SELECTED_CREDENTIALS',
  SET_AUTHORIZATION_CODE_URL = 'SET_AUTHORIZATION_CODE_URL',
  INVOKED_AUTHORIZATION_CODE_REQUEST = 'INVOKED_AUTHORIZATION_CODE_REQUEST',
  PROVIDE_AUTHORIZATION_CODE_RESPONSE = 'PROVIDE_AUTHORIZATION_CODE_RESPONSE',
}

export enum OID4VCIMachineGuards {
  hasContactGuard = 'oid4vciHasContactGuard',
  hasNoContactGuard = 'oid4vciHasNoContactGuard',
  selectCredentialGuard = 'oid4vciSelectCredentialsGuard',
  requirePinGuard = 'oid4vciRequirePinGuard',
  hasNoContactIdentityGuard = 'oid4vciHasNoContactIdentityGuard',
  requireAuthorizationGuard = 'oid4vciRequireAuthorizationGuard',
  verificationCodeGuard = 'oid4vciVerificationCodeGuard',
  createContactGuard = 'oid4vciCreateContactGuard',
  hasSelectedCredentialsGuard = 'oid4vciHasSelectedCredentialsGuard',
}

export enum OID4VCIMachineServices {
  initiate = 'initiate',
  retrieveContact = 'retrieveContact',
  addContactIdentity = 'addContactIdentity',
  createCredentialSelection = 'createCredentialSelection',
  // invokeAuthorizationRequest = 'invokeAuthorizationRequest',
  retrieveCredentials = 'retrieveCredentials',
  assertValidCredentials = 'assertValidCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  storeCredentials = 'storeCredentials',
}

export type NextEvent = {type: OID4VCIMachineEvents.NEXT};
export type PreviousEvent = {type: OID4VCIMachineEvents.PREVIOUS};
export type DeclineEvent = {type: OID4VCIMachineEvents.DECLINE};
export type CreateContactEvent = {type: OID4VCIMachineEvents.CREATE_CONTACT; data: Party};
export type SelectCredentialsEvent = {type: OID4VCIMachineEvents.SET_SELECTED_CREDENTIALS; data: Array<string>};
export type VerificationCodeEvent = {type: OID4VCIMachineEvents.SET_VERIFICATION_CODE; data: string};
export type ContactConsentEvent = {type: OID4VCIMachineEvents.SET_CONTACT_CONSENT; data: boolean};
export type ContactAliasEvent = {type: OID4VCIMachineEvents.SET_CONTACT_ALIAS; data: string};
export type SetAuthorizationCodeURLEvent = {type: OID4VCIMachineEvents.SET_AUTHORIZATION_CODE_URL; data: string};
export type InvokeAuthorizationRequestEvent = {type: OID4VCIMachineEvents.INVOKED_AUTHORIZATION_CODE_REQUEST; data: string};
export type AuthorizationResponseEvent = {type: OID4VCIMachineEvents.PROVIDE_AUTHORIZATION_CODE_RESPONSE; data: string | AuthorizationResponse};
export type OID4VCIMachineEventTypes =
  | SetAuthorizationCodeURLEvent
  | NextEvent
  | PreviousEvent
  | DeclineEvent
  | CreateContactEvent
  | SelectCredentialsEvent
  | VerificationCodeEvent
  | InvokeAuthorizationRequestEvent
  | AuthorizationResponseEvent
  | ContactConsentEvent
  | ContactAliasEvent;
