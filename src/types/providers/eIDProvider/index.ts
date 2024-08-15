import {Dispatch, SetStateAction} from 'react';
import {OpenID4VCIClient} from '@sphereon/oid4vci-client';
import {PidIssuerService} from '../../../providers/PidIssuerService';

export type EIDGetAuthorizationCodeArgs = {refreshUrl: string};

export type EIDGetAccessTokenArgs = {authorizationCode: string};

export type EIDHandleErrorArgs = {
  reason: 'cancelled' | 'card_locked' | 'unknown' | 'sdk_initialization_failed' | 'user_cancelled';
  message: string;
  error?: Error;
};

export type EIDFlowState = {
  state: 'INITIALIZED' | 'STARTED' | 'ERROR' | 'INSERT_CARD' | 'READING_CARD' | 'GETTING_AUTHORIZATION_CODE' | 'GETTING_ACCESS_TOKEN';
  progress?: number;
} & Partial<EIDHandleErrorArgs>;

export type EIDProviderArgs = {
  pidService: PidIssuerService;
  onEnterPin: () => string;
  onAuthenticated: (authorizationCode: string) => void;
  onStateChange?: Dispatch<SetStateAction<EIDFlowState>> | ((state: EIDFlowState) => void);
};

export type EIDInitializeArgs = {
  onEnterPin: () => string;
  onAuthenticated: (authorizationCode: string) => void;
  onStateChange?: Dispatch<SetStateAction<EIDFlowState>> | ((state: EIDFlowState) => void);
  pidProvider?: string;
};
