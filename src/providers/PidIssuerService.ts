import {OpenID4VCIClient} from '@sphereon/oid4vci-client';
import {OpenId4VCIVersion, PARMode, ProofOfPossessionCallbacks} from '@sphereon/oid4vci-common';
import {IIdentifierResolution} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {IJwtService} from '@sphereon/ssi-sdk-ext.jwt-service';
import {signCallback} from '@sphereon/ssi-sdk.oid4vci-holder';
import {IAgentContext, IDIDManager, IKeyManager, IResolver} from '@veramo/core';
import {EIDGetAuthorizationCodeArgs} from '../types';
import {DpopService} from './DpopService';

interface PidIssuerServiceOpts {
  credentialOffer?: string;
  pidProvider?: string;
  clientId?: string;
  kms: string;
}

type PidAgentContext = IAgentContext<IKeyManager & IDIDManager & IResolver & IIdentifierResolution & IJwtService>;

export class PidIssuerService {
  private readonly pidProvider: string;
  private readonly credentialOffer?: string;
  private client: OpenID4VCIClient;
  private readonly clientId?: string;
  private dpopService: DpopService;
  private readonly kms: string;
  private context: PidAgentContext;

  private constructor(opts: PidIssuerServiceOpts, context: PidAgentContext) {
    this.context = context;
    if (opts.pidProvider) {
      this.pidProvider = opts.pidProvider;
    }
    this.credentialOffer = opts.credentialOffer;
    this.clientId = opts.clientId;
    this.kms = opts.kms;
  }

  public static newInstance(opts: PidIssuerServiceOpts, context: PidAgentContext) {
    if (!opts.pidProvider && !opts.credentialOffer) {
      throw Error(`Cannot initialize without an issuer and without a credential offer`);
    }
    return new PidIssuerService(opts, context);
  }

  public async init(): Promise<this> {
    if (this.client) {
      return Promise.reject(Error(`Please create a new instance of the PID Issuer service instead of reusing an existing instance`));
    }
    if (this.credentialOffer) {
      this.client = await OpenID4VCIClient.fromURI({
        uri: this.credentialOffer,
        retrieveServerMetadata: true,
        clientId: this.clientId,
        createAuthorizationRequestURL: false,
      });
    } else {
      this.client = await OpenID4VCIClient.fromCredentialIssuer({
        credentialIssuer: this.pidProvider,
        retrieveServerMetadata: true,
        clientId: this.clientId,
        createAuthorizationRequestURL: false,
      });
    }

    if (this.client.version() < OpenId4VCIVersion.VER_1_0_13) {
      return Promise.reject(Error(`Only OpenID Version 13 and higher are supported for PIDs`));
    }

    this.dpopService = DpopService.newInstance(
      {
        required: true,
        // @ts-ignore
        metadata: await this.client.retrieveServerMetadata(),
        kms: this.kms,
        clientId: this.clientId,
      },
      this.context,
    );
    return this;
  }

  public async createAuthorizationRequestUrl({
    redirectUri,
    scope,
    parMode = PARMode.REQUIRE,
  }: {
    redirectUri: string;
    scope?: string;
    parMode?: PARMode;
  }): Promise<string> {
    return await this.client.createAuthorizationRequestUrl({
      authorizationRequest: {
        redirectUri,
        scope,
        clientId: this.clientId,
        parMode,
      },
    });
  }

  public async getServerMetadata() {
    return await this.client.retrieveServerMetadata();
  }

  public async getAuthorizationCode(args: EIDGetAuthorizationCodeArgs): Promise<string> {
    const {refreshUrl} = args;
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

  /**
   * This is private on purpose. We do not want to leak access tokens to any callers as we are now authenticated (authz code)
   * @private
   */
  private async getAccessToken({authorizationCode, redirectUri = 'https://sphereon.com/wallet'}: {authorizationCode: string; redirectUri?: string}) {
    const accessTokenDpop = await this.dpopService.getAccessTokenDPoPOptions({endPointUrl: this.client.getAccessTokenEndpoint()});
    console.log(`Access token DPOP: ${JSON.stringify(accessTokenDpop)}`);
    const accessTokenResponse = await this.client.acquireAccessToken({
      code: authorizationCode,
      redirectUri,
      createDPoPOpts: accessTokenDpop,
    });

    console.log(`ACCESS TOKEN: ${JSON.stringify(accessTokenResponse)}`);
    return accessTokenResponse;
  }

  public async getPids({
    authorizationCode,
    pids,
  }: {
    authorizationCode: string;
    pids: Array<{
      format: 'mso_mdoc' | 'vc+sd-jwt';
      type: 'eu.europa.ec.eudi.pid.1' | string;
    }>;
  }) {
    if (!authorizationCode) {
      return Promise.reject(Error(`Cannot get a PID without authorization code`));
    } else if (pids.length === 0) {
      return Promise.reject(Error(`Cannot get a PID if no type is provided`));
    }
    const accessTokenResponse = await this.getAccessToken({authorizationCode});
    const issuerResourceDpop = await this.dpopService.getResourceServerDPoPOptions({
      resourceRequestOpts: {
        dpopNonce: accessTokenResponse.params?.dpop?.dpopNonce,
        accessToken: accessTokenResponse.access_token,
      },
      endPointUrl: this.client.getAccessTokenEndpoint(),
    });

    return await Promise.all(
      pids.map(async pidInfo => {
        // todo: new credential keys here. We are now using the ephemeral key
        console.log(`Issuer DPOP: ${JSON.stringify(issuerResourceDpop)}`);
        const identifier = await this.dpopService.getEphemeralDPoPIdentifier();
        const jwk = identifier.jwk;
        const callbacks: ProofOfPossessionCallbacks<never> = {
          signCallback: signCallback(this.client, identifier, this.context),
        };

        const credentialResponse = await this.client.acquireCredentials({
          // 'urn:eu.europa.ec.eudi:pid:1' //sd-jwt,
          // 'eu.europa.ec.eudi.pid.1' // mdoc
          credentialTypes: pidInfo.type,
          jwk,
          alg: jwk.alg as string,
          // format: 'vc+sd-jwt',
          // format: 'mso_mdoc',
          format: pidInfo.format,
          proofCallbacks: callbacks,
          createDPoPOpts: issuerResourceDpop,
        });

        console.log(JSON.stringify(credentialResponse));
        return credentialResponse;
      }),
    );
  }

  public close() {
    if (this.dpopService) {
      this.dpopService.removeEphemeralIdentifier();
    }
  }
}
