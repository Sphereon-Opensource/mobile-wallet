import {Dispatch, SetStateAction} from 'react';
import {PidIssuerService} from '../../../providers/PidIssuerService';
import VciServiceFunkeCProvider from '../../../providers/authentication/funke/VciServiceFunkeCProvider';

export type EIDGetAuthorizationCodeArgs = {refreshUrl: string};

export type EIDGetAccessTokenArgs = {authorizationCode: string};

export type EIDHandleErrorArgs = {
  reason: 'cancelled' | 'card_locked' | 'unknown' | 'sdk_initialization_failed' | 'user_cancelled';
  message: string;
  error?: Error;
};

export type EIDFlowState = {
  state: EIDState;
  progress?: number;
} & Partial<EIDHandleErrorArgs>;

export type EIDProviderArgs = {
  pidService: PidIssuerService;
  onEnterPin: () => string;
  onAuthenticated?: (provider: VciServiceFunkeCProvider) => void;
  onStateChange?: Dispatch<SetStateAction<EIDFlowState>> | ((state: EIDFlowState) => void);
};

export type EIDInitializeArgs = {
  onEnterPin: () => string;
  onAuthenticated?: (provider: VciServiceFunkeCProvider) => void;
  onStateChange?: Dispatch<SetStateAction<EIDFlowState>> | ((state: EIDFlowState) => void);
  pidProvider?: string;
};

export type EIDState =
  | 'INITIALIZED'
  | 'STARTED'
  | 'ERROR'
  | 'SUCCESS'
  | 'INSERT_CARD'
  | 'READING_CARD'
  | 'GETTING_AUTHORIZATION_CODE'
  | 'GETTING_ACCESS_TOKEN';
