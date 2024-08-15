import {addMessageListener, AusweisAuthFlow, AusweisSdkMessage, sendCommand} from '@animo-id/expo-ausweis-sdk';
import {CreateDPoPClientOpts, getCreateDPoPOptions} from '@sphereon/oid4vc-common';
import {OpenID4VCIClient} from '@sphereon/oid4vci-client';
import {
  CredentialIssuerMetadataV1_0_11,
  CredentialIssuerMetadataV1_0_13,
  CredentialResponse,
  EndpointMetadataResult,
  PARMode,
  ProofOfPossessionCallbacks,
} from '@sphereon/oid4vci-common';
import {ManagedIdentifierJwkResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {signCallback} from '@sphereon/ssi-sdk.oid4vci-holder';
import {IKey} from '@veramo/core';
import {Dispatch, SetStateAction} from 'react';
import agent, {agentContext} from '../../agent';
import {EIDFlowState, EIDGetAccessTokenArgs, EIDGetAuthorizationCodeArgs, EIDHandleErrorArgs, EIDInitializeArgs, EIDProviderArgs} from '../../types';

class DpopService {
  async createDPoPOpts(
    metadata: Pick<EndpointMetadataResult, 'authorizationServerMetadata'> & {
      credentialIssuerMetadata: CredentialIssuerMetadataV1_0_11 | CredentialIssuerMetadataV1_0_13;
    },
  ) {
    const dpopSigningAlgs =
      metadata.authorizationServerMetadata?.dpop_signing_alg_values_supported ?? metadata.credentialIssuerMetadata.dpop_signing_alg_values_supported;

    if (!dpopSigningAlgs || dpopSigningAlgs.length === 0) {
      return;
    }
  }
}

class PIDServiceGermany {
  private readonly client: OpenID4VCIClient;
  private readonly tcTokenUrl: string;
  private readonly onStateChange?: Dispatch<SetStateAction<EIDFlowState>> | ((status: EIDFlowState) => void);
  private ephemeralDPoPId?: ManagedIdentifierJwkResult;
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
        this.getAuthorizationCode(options).then((authorizationCode: string) => this.getPid({authorizationCode}));
      },
      onInsertCard: (): void => {
        this.handleStateChange({state: 'INSERT_CARD'});
      },
    });

    this.handleStateChange({state: 'INITIALIZED'});
  }

  private static readonly _clientId = 'bc11dd24-cbe9-4f13-890b-967e5f900222';

  public static async initialize(args: EIDInitializeArgs): Promise<PIDServiceGermany> {
    const uri: string =
      'openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fdemo.pid-issuer.bundesdruckerei.de%2Fc%22%2C%22credential_configuration_ids%22%3A%5B%22pid-sd-jwt%22%5D%2C%22grants%22%3A%7B%22authorization_code%22%3A%7B%7D%7D%7D';
    // TODO: Move to fromCredentialIssuer
    const client = await OpenID4VCIClient.fromURI({
      uri,
      // const client = await OpenID4VCIClient.fromCredentialIssuer({
      //   credentialIssuer: "https://demo.pid-issuer.bundesdruckerei.de/c",
      // resolveOfferUri: true,
      retrieveServerMetadata: true,
      clientId: this._clientId,
      // This is a separate call, so we don't fetch it here, however it may be easier to just construct it here?
      createAuthorizationRequestURL: false,
    });

    const authorizationRequestUrl = await client.createAuthorizationRequestUrl({
      authorizationRequest: {
        redirectUri: 'https://sphereon.com/wallet',
        scope: 'pid',
        clientId: 'bc11dd24-cbe9-4f13-890b-967e5f900222',
        parMode: PARMode.REQUIRE,
      },
    });

    return new PIDServiceGermany({...args, client, tcTokenUrl: authorizationRequestUrl});
  }

  public async start(): Promise<AusweisAuthFlow> {
    if (this.ephemeralDPoPId) {
      // Cleanup old DPoP Key Ref if (re)started)
      void agent.keyManagerDelete({kid: this.ephemeralDPoPId.kmsKeyRef}); // we do not await. Cleanup could also already have removed it
      this.ephemeralDPoPId = undefined;
    }
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

  private async getAuthorizationCode(args: EIDGetAuthorizationCodeArgs): Promise<string> {
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

  private async getEphemeralDPoPKey() {
    let key: IKey | undefined = undefined;
    if (!this.ephemeralDPoPId) {
      // TODO: Determine both type and use ephemeral kms
      key = await agent.keyManagerCreate({type: 'Secp256r1', kms: 'local'});
      // Make sure we use our internal uniform identifier format
      const keyId = await agent.identifierManagedGetByKey({identifier: key, issuer: PIDServiceGermany._clientId});
      //fixme: We are doing this double resolution to move from a key based identifier to JWK

      this.ephemeralDPoPId = await agent.identifierManagedGetByJwk({
        method: 'jwk',
        identifier: keyId.jwk,
        kmsKeyRef: keyId.kmsKeyRef,
        issuer: PIDServiceGermany._clientId,
      });
    }
    return this.ephemeralDPoPId;
  }

  private async getPid(args: EIDGetAccessTokenArgs): Promise<CredentialResponse> {
    // TODO void
    const {authorizationCode} = args;
    this.handleStateChange({state: 'GETTING_ACCESS_TOKEN'});

    console.log(`AUTH CODE: ${authorizationCode}`);

    const metadata = await this.client.retrieveServerMetadata();
    console.log(`METADATA: ${JSON.stringify(metadata)}`);

    const alg = 'ES256';
    const issuer = await this.getEphemeralDPoPKey();
    const jwk = issuer.jwk;

    const jwtIssuer = {alg, jwk};

    console.log(`JWT Issuer: ${JSON.stringify(jwtIssuer, null, 2)}`);
    const createDPoPOpts: CreateDPoPClientOpts = {
      jwtIssuer,
      dPoPSigningAlgValuesSupported: ['ES256'],
      jwtPayloadProps: {},
      createJwtCallback: async (jwtIssuer, jwt) => {
        console.log(`JWT CALLBACK issuer: ${JSON.stringify(jwtIssuer)}`);
        console.log(`JWT: ${JSON.stringify(jwt)}`);

        console.log(`ID: ${JSON.stringify(issuer)}`);
        const jwtResult = await agent.jwtCreateJwsCompactSignature({
          issuer,
          // @ts-ignore // VCI client allows jwk without kty. Should be fixed there, as it causes issues down below if this check is not there
          protectedHeader: {...jwt.header, alg: jwtIssuer.alg},
          payload: jwt.payload,
        });

        const signedJwt = jwtResult.jwt;

        /*const signedJwt = await signDidJWT({
          options: {
            issuer: jwk.kid!, // fixme: remove. Iss is not needed and only our did-jwt requires it. Replace with regular jwt package anyway
          },
          idOpts: {
            identifier: this.removemeDPoPDid,
            kmsKeyRef: key.kid,
          },
          // @ts-ignore
          header: {...jwt.header, jwk: jwtIssuer.jwk, alg: jwtIssuer.alg},
          payload: jwt.payload,

          context: agentContext,
        });*/
        console.log(`Resulting JWT: ${signedJwt}`);

        return signedJwt;
      },
    };
    const dPoP = getCreateDPoPOptions(createDPoPOpts, this.client.getAccessTokenEndpoint());

    console.log(`DPOP: ${JSON.stringify(dPoP)}`);
    const accessTokenResponse = await this.client.acquireAccessToken({
      code: authorizationCode,
      redirectUri: 'https://sphereon.com/wallet',
      createDPoPOpts: dPoP,
    });

    console.log(`ACCESS TOKEN: ${JSON.stringify(accessTokenResponse)}`);
    const identifier = await this.getEphemeralDPoPKey();
    // @ts-ignore
    // fixme
    identifier.method = 'jwk';
    const callbacks: ProofOfPossessionCallbacks<never> = {
      signCallback: signCallback(this.client, identifier, agentContext),
    };

    const credDpop = getCreateDPoPOptions(
      {
        ...createDPoPOpts,
        jwtPayloadProps: {
          ...createDPoPOpts?.jwtPayloadProps,
          nonce: accessTokenResponse.params?.dpop?.dpopNonce,
          accessToken: accessTokenResponse.access_token,
        },
      },
      this.client.getAccessTokenEndpoint(),
      {accessToken: accessTokenResponse.access_token},
    );

    const credentialResponse = await this.client.acquireCredentials({
      // credentialTypes: 'urn:eu.europa.ec.eudi:pid:1',
      credentialTypes: 'eu.europa.ec.eudi.pid.1',
      jwk,
      alg: jwk.alg as string,
      // format: 'vc+sd-jwt',
      format: 'mso_mdoc',
      // kid: key.kid,
      proofCallbacks: callbacks,
      createDPoPOpts: credDpop,
    });

    console.log(JSON.stringify(credentialResponse, null, 2));
    return credentialResponse;
  }
}

export default PIDServiceGermany;
