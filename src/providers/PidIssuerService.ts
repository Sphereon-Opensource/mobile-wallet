import {createDPoP, CreateDPoPJwtPayloadProps, CreateDPoPOpts, getCreateDPoPOptions, SigningAlgo} from '@sphereon/oid4vc-common';
import {OpenID4VCIClientV1_0_13} from '@sphereon/oid4vci-client';
import {
  AuthorizationServerMetadata,
  CredentialResponse,
  DPoPResponseParams,
  IssuerMetadataV1_0_13,
  OpenId4VCIVersion,
  PARMode,
  ProofOfPossessionCallbacks,
} from '@sphereon/oid4vci-common';
import {IIdentifierResolution, ManagedIdentifierJwkOpts, ManagedIdentifierResult} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {IJwtService} from '@sphereon/ssi-sdk-ext.jwt-service';
import {toJwk} from '@sphereon/ssi-sdk-ext.key-utils';
import {signCallback} from '@sphereon/ssi-sdk.oid4vci-holder';
import {IAgentContext, IDIDManager, IKeyManager, IResolver} from '@veramo/core';
import {EIDGetAuthorizationCodeArgs} from '../types';
import {keyTypeFromCryptographicSuite} from '../utils';
import {algorithmsFromKeyType, DpopService} from './DpopService';
import store from '../store';
import {LOGIN_SUCCESS} from '../types/store/user.action.types';
import {CREATE_DPOP_SUCCESS} from '../types/store/dpop.action.types';

interface PidIssuerServiceOpts {
  credentialOffer?: string;
  pidProvider?: string;
  clientId?: string;
  kms: string;
}

type PidAgentContext = IAgentContext<IKeyManager & IDIDManager & IResolver & IIdentifierResolution & IJwtService>;

export type PidResponse = CredentialResponse & {
  params?: DPoPResponseParams;
  access_token: string;
  identifier?: ManagedIdentifierResult | undefined;
};

interface PidRequestInfo {
  format: 'mso_mdoc' | 'vc+sd-jwt';
  type: 'eu.europa.ec.eudi.pid.1' | string;
}

export class PidIssuerService {
  private readonly pidProvider: string;
  private readonly credentialOffer?: string;
  private client: OpenID4VCIClientV1_0_13;
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
      this.client = await OpenID4VCIClientV1_0_13.fromURI({
        uri: this.credentialOffer,
        retrieveServerMetadata: true,
        clientId: this.clientId,
        createAuthorizationRequestURL: false,
      });
    } else {
      this.client = await OpenID4VCIClientV1_0_13.fromCredentialIssuer({
        credentialIssuer: this.pidProvider,
        retrieveServerMetadata: true,
        clientId: this.clientId,
        createAuthorizationRequestURL: false,
      });
    }

    if (this.client.version() < OpenId4VCIVersion.VER_1_0_13) {
      return Promise.reject(Error(`Only OpenID Version 13 and higher are supported for PIDs`));
    }
    const metadata = await this.client.retrieveServerMetadata();
    this.dpopService = DpopService.newInstance(
      {
        required: true,
        // @ts-ignore // because of the versions/types we support
        metadata,
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
    // method is lazy anyway, so we are not constantly hitting the metadata endpoint
    return await this.client.retrieveServerMetadata();
  }

  public async getCredentialIssuerMetadata() {
    const metadata = await this.getServerMetadata();
    if (!metadata.credentialIssuerMetadata) {
      return Promise.reject(Error(`Could not retrieve credential issuer metadata from PID provider`));
    }
    return metadata.credentialIssuerMetadata as Partial<AuthorizationServerMetadata> & IssuerMetadataV1_0_13;
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
    noCredentialRequestProof = false,
  }: {
    authorizationCode: string;
    pids: Array<PidRequestInfo>;
    noCredentialRequestProof?: boolean;
  }): Promise<Array<PidResponse>> {
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
    let currentNonce: string | undefined = accessTokenResponse.c_nonce;

    let responses: (CredentialResponse & {params?: DPoPResponseParams; access_token: string; identifier?: ManagedIdentifierResult})[] = [];

    store.dispatch<any>({
      type: CREATE_DPOP_SUCCESS,
      payload: {dpop: accessTokenResponse.params?.dpop, accessToken: accessTokenResponse.access_token},
    });

    for (const pidInfo of pids) {
      const {identifier, credentialResponse, nonce} = await this.getPid({pidInfo, issuerResourceDpop, currentNonce, noCredentialRequestProof});
      currentNonce = nonce;
      responses.push({...credentialResponse, identifier});
    }
    return responses;
  }

  private async getPid({
    pidInfo,
    issuerResourceDpop,
    currentNonce,
    noCredentialRequestProof = false,
  }: {
    pidInfo: PidRequestInfo;
    issuerResourceDpop?: CreateDPoPOpts<CreateDPoPJwtPayloadProps>;
    currentNonce?: string;
    noCredentialRequestProof?: boolean;
  }) {
    let credentialResponse: CredentialResponse & {params?: DPoPResponseParams; access_token: string};

    let identifier: ManagedIdentifierResult | undefined = undefined;
    if (noCredentialRequestProof) {
      const credentialRequestOpts = {
        // 'urn:eu.europa.ec.eudi:pid:1' //sd-jwt,
        // 'eu.europa.ec.eudi.pid.1' // mdoc
        credentialTypes: [pidInfo.type],

        alg: 'ES256',
        // format: 'vc+sd-jwt',
        // format: 'mso_mdoc',
        format: pidInfo.format,
        createDPoPOpts: issuerResourceDpop,
      };
      credentialResponse = await this.client.acquireCredentialsWithoutProof(credentialRequestOpts);
    } else {
      identifier = await this.createPidKey(pidInfo);
      console.log(`Issuer DPOP: ${JSON.stringify(issuerResourceDpop)}`);
      // const identifier: ManagedIdentifierResult = await this.dpopService.getEphemeralDPoPIdentifier();
      const jwk = identifier.jwk;
      const callbacks: ProofOfPossessionCallbacks<never> = {
        signCallback: signCallback(identifier, this.context, currentNonce),
      };

      const credentialRequestOpts = {
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
      };
      credentialResponse = await this.client.acquireCredentials(credentialRequestOpts);
    }
    console.log(JSON.stringify(credentialResponse));
    return {identifier, credentialResponse, nonce: credentialResponse.c_nonce};
  }

  async getIssuerSupportedProofAlgs(pidInfo: PidRequestInfo) {
    const metadata = await this.getCredentialIssuerMetadata();
    const credConfig = Object.values(metadata.credential_configurations_supported).find(conf => conf.format === pidInfo.format);
    const algsSupported = credConfig?.proof_types_supported?.jwt?.proof_signing_alg_values_supported;
    if (algsSupported && algsSupported.length > 0) {
      return algsSupported;
    }
    // We look at credential signing alg first. This acts as a fallback as we can use algs we know the issuer supports for its credentials
    return credConfig?.credential_signing_alg_values_supported ?? ['ES256'];
  }

  async getClientSupportedProofAlg(pidInfo: PidRequestInfo) {
    const supported = await this.getIssuerSupportedProofAlgs(pidInfo);
    const algos = supported.filter(alg => Object.values(SigningAlgo).includes(alg as SigningAlgo)).map(alg => alg as SigningAlgo);
    return algos.length > 0 ? algos[0] : SigningAlgo.ES256;
  }

  async getKeyTypeAndAlgSupported(pidInfo: PidRequestInfo) {
    const alg = await this.getClientSupportedProofAlg(pidInfo);
    const keyType = keyTypeFromCryptographicSuite(alg);
    return {alg, keyType};
  }

  async createPidKey(pidInfo: PidRequestInfo): Promise<ManagedIdentifierResult> {
    const {keyType, alg} = await this.getKeyTypeAndAlgSupported(pidInfo);
    const key = await this.context.agent.keyManagerCreate({
      type: keyType,
      kms: this.kms,
      meta: {
        primaryAlgorithm: alg,
        algorithms: algorithmsFromKeyType(keyType),
        keyAlias: `pid-${pidInfo.type}-${pidInfo.format}-${new Date().getTime()}`,
      },
    });

    let opts: ManagedIdentifierJwkOpts = {
      method: 'jwk',
      identifier: toJwk(key.publicKeyHex, key.type, {key}),
      issuer: this.clientId,
      kmsKeyRef: key.kid,
    };

    return await this.context.agent.identifierManagedGet(opts);
  }

  public close() {
    if (this.dpopService) {
      this.dpopService.removeEphemeralIdentifier();
    }
  }
}
