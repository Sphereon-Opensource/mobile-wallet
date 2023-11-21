import {ReactNode} from 'react';
import {BaseActionObject, Interpreter, ResolveTypegenMeta, ServiceMap, State, StateMachine, TypegenDisabled} from 'xstate';
import {VerifiableCredential} from '@veramo/core';
import {IContact} from '@sphereon/ssi-sdk.data-store';
import {IVerifiableCredential} from '@sphereon/ssi-types';
import OpenId4VcIssuanceProvider, {CredentialFromOffer} from '../../../providers/credential/OpenId4VcIssuanceProvider';
import {ErrorDetails} from '../../error';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {IQrData} from '../../qr';
import {ICredentialTypeSelection} from '../../credential';

export type MappedCredentialOffer = {
  correlationId: string;
  credentialOffer: CredentialFromOffer;
  uniformVerifiableCredential: IVerifiableCredential;
  rawVerifiableCredential: VerifiableCredential;
};

export type OID4VCIMachineContext = {
  requestData?: IQrData; // TODO fix type as this is not always a qr code (deeplink)
  credentialSelection: Array<ICredentialTypeSelection>;
  contactAlias: string;
  contact?: IContact;
  selectedCredentials: Array<string>;
  credentialOffers: Array<MappedCredentialOffer>;
  verificationCode?: string;
  hasContactConsent: boolean;
  error?: ErrorDetails;
  openId4VcIssuanceProvider?: OpenId4VcIssuanceProvider;
};

export enum OID4VCIMachineStates {
  initiate = 'initiate',
  createCredentialSelection = 'createCredentialSelection',
  retrieveContact = 'retrieveContact',
  transitionFromSetup = 'transitionFromSetup',
  addContact = 'addContact',
  transitionFromContactSetup = 'transitionFromContactSetup',
  selectCredentials = 'selectCredentials',
  transitionFromSelectingCredentials = 'transitionFromSelectingCredentials',
  verifyPin = 'verifyPin',
  retrieveCredentialsOffers = 'retrieveCredentialsOffers',
  transitionFromWalletInput = 'transitionFromWalletInput',
  addContactIdentity = 'addContactIdentity',
  reviewCredentials = 'reviewCredentials',
  verifyCredentials = 'verifyCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  storeCredentials = 'storeCredentials',
  showError = 'showError',
  aborted = 'aborted',
  declined = 'declined',
  error = 'error',
  done = 'done',
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

export type OIDVCIProviderProps = {
  children?: ReactNode;
  customOID4VCIInstance?: OID4VCIMachineInterpreter;
};

export type OID4VCIContext = {
  oid4vciInstance?: OID4VCIMachineInterpreter;
};

export type OID4VCIMachineNavigationArgs = {
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
}

export enum OID4VCIMachineGuards {
  hasContactGuard = 'oid4vciHasContactGuard',
  hasNotContactGuard = 'oid4vciHasNoContactGuard',
  supportedCredentialsGuard = 'oid4vciSupportedCredentialsGuard',
  requirePinGuard = 'oid4vciRequirePinGuard',
  contactHasNotIdentityGuard = 'oid4vciHasNoContactIdentityGuard',
  verificationCodeGuard = 'oid4vciVerificationCodeGuard',
  createContactGuard = 'oid4vciCreateContactGuard',
  hasSelectedCredentialsGuard = 'oid4vciHasSelectedCredentialsGuard',
}

export enum OID4VCIMachineServices {
  initiate = 'initiate',
  retrieveContact = 'retrieveContact',
  addContactIdentity = 'addContactIdentity',
  createCredentialSelection = 'createCredentialSelection',
  retrieveCredentialOffers = 'retrieveCredentialOffers',
  assertValidCredentials = 'assertValidCredentials',
  storeCredentialBranding = 'storeCredentialBranding',
  storeCredentials = 'storeCredentials',
}

export type NextEvent = {type: OID4VCIMachineEvents.NEXT};
export type PreviousEvent = {type: OID4VCIMachineEvents.PREVIOUS};
export type DeclineEvent = {type: OID4VCIMachineEvents.DECLINE};
export type CreateContactEvent = {type: OID4VCIMachineEvents.CREATE_CONTACT; data: IContact};
export type SelectCredentialsEvent = {type: OID4VCIMachineEvents.SET_SELECTED_CREDENTIALS; data: Array<string>};
export type VerificationCodeEvent = {type: OID4VCIMachineEvents.SET_VERIFICATION_CODE; data: string};
export type ContactConsentEvent = {type: OID4VCIMachineEvents.SET_CONTACT_CONSENT; data: boolean};
export type ContactAliasEvent = {type: OID4VCIMachineEvents.SET_CONTACT_ALIAS; data: string};
export type OID4VCIMachineEventTypes =
  | NextEvent
  | PreviousEvent
  | DeclineEvent
  | CreateContactEvent
  | SelectCredentialsEvent
  | VerificationCodeEvent
  | ContactConsentEvent
  | ContactAliasEvent;
