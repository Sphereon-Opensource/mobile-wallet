import {addMessageListener, AusweisAuthFlow, AusweisSdkMessage, sendCommand} from '@animo-id/expo-ausweis-sdk';
import {PARMode} from '@sphereon/oid4vci-common';
import {Dispatch, SetStateAction} from 'react';
import {agentContext} from '../../../agent';
import {sphereonKeyManager} from '../../../agent/plugins';
import {PIDSecurityModel, storageIsPIDSecurityModel} from '../../../services/storageService';
import {EIDFlowState, EIDGetAccessTokenArgs, EIDHandleErrorArgs, EIDInitializeArgs, EIDProviderArgs} from '../../../types';
import {PidIssuerService, PidResponse} from '../../PidIssuerService';

class VciServiceFunkeCProvider {
  private readonly onStateChange?: Dispatch<SetStateAction<EIDFlowState>> | ((status: EIDFlowState) => void);
  private static readonly _funke_clientId = 'bc11dd24-cbe9-4f13-890b-967e5f900222';
  private readonly pidService: PidIssuerService;
  private retryCounter?: number;
  private authFlow: AusweisAuthFlow;
  public currentState: EIDFlowState;
  public refreshUrl: string;

  private constructor(args: EIDProviderArgs) {
    const {pidService, onStateChange, onAuthenticated, onEnterPin: handlePinEntry} = args;

    this.pidService = pidService;
    this.onStateChange = onStateChange;
    this.authFlow = new AusweisAuthFlow({
      onEnterPin: async (options): Promise<string> => {
        if (!this.retryCounter) {
          return Promise.reject(Error('Unable to determine initial pin retry count'));
        } else if (this.retryCounter === 0) {
          return Promise.reject(Error('Card Locked'));
        } else if (options.attemptsRemaining < this.retryCounter) {
          this.retryCounter = options.attemptsRemaining;
          return Promise.reject(Error('Incorrect pin entered'));
        }
        return handlePinEntry();
      },
      onError: (error): void => {
        this.handleError(error);
      },
      onSuccess: (options): void => {
        this.refreshUrl = options.refreshUrl;
        this.handleStateChange({state: 'SUCCESS'});
        onAuthenticated?.(this);
      },
      onAttachCard: (): void => {
        this.handleStateChange({state: 'INSERT_CARD'});
      },
    });

    this.handleStateChange({state: 'INITIALIZED'});
  }

  public static async initialize(args: EIDInitializeArgs): Promise<VciServiceFunkeCProvider> {
    const {pidProvider} = args;
    const credentialOffer = (await storageIsPIDSecurityModel(PIDSecurityModel.EID_DURING_PRESENTATION))
      ? 'openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fdemo.pid-issuer.bundesdruckerei.de%2Fc2%22%2C%22credential_configuration_ids%22%3A%5B%22pid-sd-jwt%22%5D%2C%22grants%22%3A%7B%22authorization_code%22%3A%7B%7D%7D%7D'
      : 'openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fdemo.pid-issuer.bundesdruckerei.de%2Fc%22%2C%22credential_configuration_ids%22%3A%5B%22pid-sd-jwt%22%5D%2C%22grants%22%3A%7B%22authorization_code%22%3A%7B%7D%7D%7D';
    const pidService = PidIssuerService.newInstance(
      {pidProvider, clientId: VciServiceFunkeCProvider._funke_clientId, credentialOffer, kms: sphereonKeyManager.defaultKms},
      agentContext,
    );
    return new VciServiceFunkeCProvider({...args, pidService});
  }

  public async start(): Promise<AusweisAuthFlow> {
    await this.pidService.init();
    const tcTokenUrl = await this.pidService.createAuthorizationRequestUrl({
      redirectUri: 'https://sphereon.com/wallet',
      scope: 'pid',
      parMode: PARMode.REQUIRE,
    });

    addMessageListener((message: AusweisSdkMessage): void => {
      // set the initial retry count -1 as this one does not share the same format as the value in onEnterPin
      if (message.msg === 'ENTER_PIN' && this.retryCounter === undefined && message.reader.card?.retryCounter) {
        this.retryCounter = message.reader.card?.retryCounter - 1;
      }

      if (message.msg === 'STATUS' && (this.currentState.state === 'READING_CARD' || this.currentState.state === 'INSERT_CARD')) {
        this.handleStateChange({state: 'READING_CARD', progress: message.progress});
      }
    }).remove;

    const flow = this.authFlow.start({tcTokenUrl});
    this.handleStateChange({state: 'STARTED'});
    return flow;
  }

  public async cancel(): Promise<void> {
    sendCommand({cmd: 'CANCEL'});
  }

  private handleError(error: EIDHandleErrorArgs): void {
    const state: EIDFlowState = {
      state: 'ERROR',
      reason: error.reason,
      message: error.message,
    };

    console.log(`Ausweis SDK error ${JSON.stringify(state)}`);

    this.handleStateChange(state);
  }

  private handleStateChange(state: EIDFlowState): void {
    this.currentState = state;
    this.onStateChange?.(state);
  }

  public async getAuthorizationCode(): Promise<string> {
    this.handleStateChange({state: 'GETTING_AUTHORIZATION_CODE'});
    return this.pidService.getAuthorizationCode({refreshUrl: this.refreshUrl});
  }

  public async getPids(args: EIDGetAccessTokenArgs): Promise<Array<PidResponse>> {
    const {authorizationCode} = args;
    this.handleStateChange({state: 'GETTING_ACCESS_TOKEN'});

    const pids = await this.pidService.getPids({
      authorizationCode,
      pids: [
        {
          format: 'vc+sd-jwt',
          type: 'https://example.bmi.bund.de/credential/pid/1.0', //'pid-sd-jwt'
        },
        {
          format: 'mso_mdoc',
          type: 'eu.europa.ec.eudi.pid.1',
        },
      ],
      noCredentialRequestProof: await storageIsPIDSecurityModel(PIDSecurityModel.EID_DURING_PRESENTATION),
    });
    this.pidService.close();
    return pids;
  }
}

export default VciServiceFunkeCProvider;
