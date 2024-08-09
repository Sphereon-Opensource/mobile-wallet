import {Dispatch, SetStateAction} from 'react';
import {addMessageListener, AusweisAuthFlow, AusweisSdkMessage, sendCommand} from '@animo-id/expo-ausweis-sdk';
import {PARMode} from '@sphereon/oid4vci-common';
import {createDPoP, CreateDPoPClientOpts, getCreateDPoPOptions} from '@sphereon/oid4vc-common';
import {AccessTokenClient, OpenID4VCIClient} from '@sphereon/oid4vci-client';
import {EIDFlowState, EIDGetAccessTokenArgs, EIDGetAuthorizationCodeArgs, EIDHandleErrorArgs, EIDInitializeArgs, EIDProviderArgs} from '../../types';

class PIDServiceGermany {
  private readonly client: OpenID4VCIClient;
  private readonly tcTokenUrl: string;
  private readonly onStateChange?: Dispatch<SetStateAction<EIDFlowState>> | ((status: EIDFlowState) => void);
  private authFlow: AusweisAuthFlow;
  public currentState: EIDFlowState;

  private constructor(args: EIDProviderArgs) {
    const {client, onStateChange, onAuthenticated, onEnterPin, tcTokenUrl} = args;

    this.tcTokenUrl = tcTokenUrl;
    this.client = client;
    this.onStateChange = onStateChange;
    this.authFlow = new AusweisAuthFlow({
      onEnterPin,
      onError: (error): void => {
        this.handleError(error);
      },
      onSuccess: (options): void => {
        this.getAuthorizationToken(options).then((authorizationCode: string) => this.getAccessToken({authorizationCode}));
      },
      onInsertCard: (): void => {
        this.handleStateChange({state: 'INSERT_CARD'});
      },
    });

    this.handleStateChange({state: 'INITIALIZED'});
  }

  public static async initialize(args: EIDInitializeArgs): Promise<PIDServiceGermany> {
    const uri: string =
      'openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fdemo.pid-issuer.bundesdruckerei.de%2Fc%22%2C%22credential_configuration_ids%22%3A%5B%22pid-sd-jwt%22%5D%2C%22grants%22%3A%7B%22authorization_code%22%3A%7B%7D%7D%7D';
    const client = await OpenID4VCIClient.fromURI({
      uri,
      resolveOfferUri: true,
      retrieveServerMetadata: true,
      clientId: 'bc11dd24-cbe9-4f13-890b-967e5f900222',
      // This is a separate call, so we don't fetch it here, however it may be easier to just construct it here?
      createAuthorizationRequestURL: false,
    });

    const authorizationRequestUrl = await client.createAuthorizationRequestUrl({
      authorizationRequest: {
        redirectUri: 'https://sphereon.com/redirect',
        scope: 'pid',
        //authorizationDetails: authDetails,
        parMode: PARMode.REQUIRE,
      },
    });

    return new PIDServiceGermany({...args, client, tcTokenUrl: authorizationRequestUrl});
  }

  public async start(): Promise<AusweisAuthFlow> {
    addMessageListener((message: AusweisSdkMessage): void => {
      if (message.msg === 'STATUS' && (this.currentState.state === 'READING_CARD' || this.currentState.state === 'INSERT_CARD')) {
        this.handleStateChange({state: 'READING_CARD', progress: message.progress});
      }
    }).remove;

    const flow = this.authFlow.start({tcTokenUrl: this.tcTokenUrl});
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
    this.handleStateChange(state);
  }

  private handleStateChange(state: EIDFlowState): void {
    this.currentState = state;
    this.onStateChange?.(state);
  }

  private async getAuthorizationToken(args: EIDGetAuthorizationCodeArgs): Promise<string> {
    const {refreshUrl} = args;
    this.handleStateChange({state: 'GETTING_AUTHORIZATION_CODE'});

    return fetch(refreshUrl).then(response => {
      // FIXME we need to fix the redirect URL as it is now returning a 404, but the response still contains the URL we need with the code
      // if (!response.ok) {
      //     return Promise.reject(new Error(`Request failed with code: ${response.status}`))
      // }

      // FIXME we can remove this check one we fixed the redirect URL
      if (!response.url) {
        return Promise.reject(new Error('Response does not contain a url'));
      }

      const authorizationCode = new URL(response.url).searchParams.get('code');

      if (!authorizationCode) {
        return Promise.reject(new Error(`Response url does not contain an authorization code`));
      }

      return authorizationCode;
    });
  }

  private async getAccessToken(args: EIDGetAccessTokenArgs): Promise<string | void> {
    // TODO void
    const {authorizationCode} = args;
    this.handleStateChange({state: 'GETTING_ACCESS_TOKEN'});

    console.log(`AUTH CODE: ${authorizationCode}`);

    const metadata = await this.client.retrieveServerMetadata();
    console.log(`METADATA: ${JSON.stringify(metadata)}`);

    const alg = 'HS256';
    const jwk = {kty: 'Ed25519', crv: 'Ed25519', x: '123', y: '123'};
    const jwtIssuer = {alg, jwk};
    const htm = 'POST';
    const htu = 'https://example.com/token';
    const nonce = 'nonce';
    const createDPoPOpts: CreateDPoPClientOpts = {
      jwtIssuer: jwtIssuer,
      dPoPSigningAlgValuesSupported: [
        'RS256',
        'RS384',
        'RS512',
        'PS256',
        'PS384',
        'PS512',
        'ES256',
        'ES256K',
        'ES384',
        'ES512',
        'EdDSA',
        'Ed25519',
        'Ed448',
      ],
      jwtPayloadProps: {htm, htu, nonce} as const,
      createJwtCallback: async (dpopJwtIssuerWithContext, jwt) => {
        return 'eyJhbGciOiJIUzI1NiIsImp3ayI6eyJrdHkiOiJFZDI1NTE5IiwiY3J2IjoiRWQyNTUxOSIsIngiOiIxMjMiLCJ5IjoiMTIzIn0sInR5cCI6ImRwb3Arand0In0.eyJodG0iOiJQT1NUIiwiaHR1IjoiaHR0cHM6Ly9leGFtcGxlLmNvbS90b2tlbiIsIm5vbmNlIjoibm9uY2UiLCJpYXQiOjE3MjIzMjcxOTQsImp0aSI6Ijk4OWNiZTc4LWI1ZTYtNDViYS1iYjMzLWQ0MGE4ZGEwZjFhYSJ9';
      },
    };
    const dPoP = await createDPoP(getCreateDPoPOptions(createDPoPOpts, metadata.authorizationServerMetadata!.token_endpoint!)); // TODO

    console.log(`DPOP: ${JSON.stringify(dPoP)}`);

    // const accessToken = await this.client.acquireAccessToken({
    //     code: authorizationCode,
    //
    // })

    const accessTokenClient = new AccessTokenClient();

    const accessTokenResponse = await accessTokenClient.acquireAccessToken({
      metadata: metadata,
      //credentialOffer: { credential_offer: credentialOfferRequestWithBaseUrl.credential_offer },
      //pin: 'txCode',
      code: authorizationCode,
      codeVerifier: 'no idea',
      redirectUri: 'https://sphereon.com',
      // @ts-ignore // TODO why does this complain about not having this arg?
      createDPoPOpts,
    });

    console.log(`ACCESS TOKEN: ${JSON.stringify(accessTokenResponse)}`);
  }
}

export default PIDServiceGermany;
