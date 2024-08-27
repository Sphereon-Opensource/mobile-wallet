import {CreateDPoPClientOpts, CreateDPoPOpts, getCreateDPoPOptions as getCreateDPoPOptionsLibFunction, SigningAlgo} from '@sphereon/oid4vc-common';
import {CredentialIssuerMetadataV1_0_13, EndpointMetadataResult} from '@sphereon/oid4vci-common';
import {
  IIdentifierResolution,
  ManagedIdentifierJwkOpts,
  ManagedIdentifierResult,
  ManagedIdentifierX5cOpts,
} from '@sphereon/ssi-sdk-ext.identifier-resolution';
import {toJwk} from '@sphereon/ssi-sdk-ext.key-utils';
import {IAgentContext, IKeyManager} from '@veramo/core';
import {keyTypeFromCryptographicSuite} from '../utils';
import {IJwtService} from '@sphereon/ssi-sdk-ext.jwt-service';

type DpopAgentContext = IAgentContext<IIdentifierResolution & IKeyManager & IJwtService>;

export type DpopOpts = {
  alg?: SigningAlgo;
  metadata: Pick<EndpointMetadataResult, 'authorizationServerMetadata'> & {
    credentialIssuerMetadata: CredentialIssuerMetadataV1_0_13;
  };
  required?: boolean;
  clientId?: string;
  kms: string;
  x5c?: string[];
  method?: 'jwk' | 'x5c';
};

export class DpopService {
  private ephemeralDPoPIdentifier?: ManagedIdentifierResult;
  private readonly context: DpopAgentContext;
  private readonly opts: DpopOpts;
  private readonly dPoPSigningAlgValuesSupported: Array<SigningAlgo | string>;

  private constructor(opts: DpopOpts, context: DpopAgentContext) {
    if (!opts.method) {
      opts.method = 'jwk';
    } else if (opts.method === 'x5c' && !opts.x5c) {
      throw Error(`Please provide an x5c value if you want to use X.509 certificate chains`);
    }
    this.context = context;
    this.opts = opts;
    this.dPoPSigningAlgValuesSupported =
      opts.metadata.authorizationServerMetadata?.dpop_signing_alg_values_supported ??
      opts.metadata.credentialIssuerMetadata.dpop_signing_alg_values_supported ??
      [];
  }

  public static newInstance(opts: DpopOpts, context: DpopAgentContext) {
    return new DpopService(opts, context);
  }

  private async createDPoPClientOpts(opts?: {
    resourceRequestOpts?: {
      accessToken: string;
      dpopNonce?: string;
    };
  }): Promise<CreateDPoPClientOpts | undefined> {
    const {alg, dpopSupported} = this.validateDpopSupport();
    if (!dpopSupported) {
      return;
    }

    const {dpopNonce, accessToken} = opts?.resourceRequestOpts ?? {};
    const identifier = await this.getEphemeralDPoPIdentifier();
    const jwk = identifier.jwk;
    const jwtIssuer = {alg, jwk};
    return {
      jwtIssuer,
      dPoPSigningAlgValuesSupported: this.dPoPSigningAlgValuesSupported,
      jwtPayloadProps: {...(dpopNonce && {nonce: dpopNonce}), ...(accessToken && {accessToken})},
      createJwtCallback: async (jwtIssuer, jwt) => {
        const jwtResult = await this.context.agent.jwtCreateJwsCompactSignature({
          issuer: identifier,
          // @ts-ignore // VCI client allows jwk without kty. Should be fixed there, as it causes issues down below if this check is not there
          protectedHeader: {...jwt.header, alg: jwtIssuer.alg},
          payload: jwt.payload,
        });

        return jwtResult.jwt;
      },
    } satisfies CreateDPoPClientOpts;
  }

  async getAccessTokenDPoPOptions({endPointUrl}: {endPointUrl: string}): Promise<CreateDPoPOpts | undefined> {
    const dpopClientOpts = await this.createDPoPClientOpts();
    return dpopClientOpts ? getCreateDPoPOptionsLibFunction(dpopClientOpts, endPointUrl) : undefined;
  }

  async getResourceServerDPoPOptions(opts: {
    endPointUrl: string;
    resourceRequestOpts?: {
      accessToken: string;
      dpopNonce?: string;
    };
  }): Promise<CreateDPoPOpts | undefined> {
    const {resourceRequestOpts, endPointUrl} = opts;
    const dpopClientOpts = await this.createDPoPClientOpts({resourceRequestOpts});
    if (!dpopClientOpts) {
      return Promise.reject(Error(`Cannot create resource server DPoP options if DPoP is not supported`));
    }
    const accessToken = resourceRequestOpts?.accessToken;
    return getCreateDPoPOptionsLibFunction(dpopClientOpts, endPointUrl, accessToken ? {accessToken} : undefined);
  }

  async getEphemeralDPoPIdentifier(): Promise<ManagedIdentifierResult> {
    // todo: create ephemeral key service that cleans up keys after a certain amount of time
    if (!this.ephemeralDPoPIdentifier) {
      const {method, kms, clientId} = this.opts;

      const {alg} = this.validateDpopSupport();
      const keyType = keyTypeFromCryptographicSuite(alg);
      const key = await this.context.agent.keyManagerCreate({
        type: keyType,
        kms,
        meta: {
          algorithms: algorithmsFromKeyType(keyType),
          keyAlias: `dpop-${new Date().getTime()}`, // Random alias for now
        },
      });

      const x5c = this.opts.x5c ?? key.meta?.x509?.x5c;

      let opts: ManagedIdentifierX5cOpts | ManagedIdentifierJwkOpts;
      if (method === 'x5c') {
        if (!x5c) {
          return Promise.reject(`Could not determine identifier from options or key for method ${method}`);
        }
        opts = {method: 'x5c', identifier: x5c};
      } else {
        opts = {method: 'jwk', identifier: toJwk(key.publicKeyHex, key.type, {key})};
      }
      opts.kmsKeyRef = key.kid;
      opts.issuer = clientId;
      this.ephemeralDPoPIdentifier = await this.context.agent.identifierManagedGet(opts);
    }
    return this.ephemeralDPoPIdentifier;
  }

  private validateDpopSupport(): {dpopSupported: boolean; alg: SigningAlgo} {
    const {required, alg = SigningAlgo.ES256} = this.opts;
    if (!this.dPoPSigningAlgValuesSupported || this.dPoPSigningAlgValuesSupported.length === 0) {
      // Issuer does not support DPoP
      if (required) {
        throw Error(`DPoP security is required, but the other party does not support it`);
      }
      return {dpopSupported: false, alg};
    } else if (!this.dPoPSigningAlgValuesSupported.includes(alg)) {
      throw Error(`DPoP security algorithm ${alg} is not supported`);
    }
    return {dpopSupported: true, alg};
  }

  public removeEphemeralIdentifier() {
    if (this.ephemeralDPoPIdentifier) {
      // we do not await as we will remove the identifier anyway
      try {
        void this.context.agent.keyManagerDelete({kid: this.ephemeralDPoPIdentifier.kmsKeyRef});
      } catch (error) {
        // Ephemeral key could have already been cleaned up at this point
        console.error(error);
      }
      this.ephemeralDPoPIdentifier = undefined;
    }
  }
}

const algorithmsFromKeyType = (type: string): string[] => [type];
