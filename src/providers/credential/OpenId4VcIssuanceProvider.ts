import {OpenID4VCIClient} from '@sphereon/oid4vci-client';
import {
  AccessTokenResponse,
  AuthorizationResponse,
  AuthorizationServerMetadata,
  CredentialIssuerMetadata,
  CredentialOfferFormat,
  CredentialResponse,
  CredentialsSupportedDisplay,
  CredentialSupported,
  DefaultURISchemes,
  EndpointMetadataResult,
  IssuerMetadataV1_0_08,
  Jwt,
  MetadataDisplay,
  OpenId4VCIVersion,
  ProofOfPossessionCallbacks,
  toAuthorizationResponsePayload,
} from '@sphereon/oid4vci-common';
import {KeyUse} from '@sphereon/ssi-sdk-ext.did-resolver-jwk';
import {getFirstKeyWithRelation} from '@sphereon/ssi-sdk-ext.did-utils';
import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {GetCredentialsArgs} from '@sphereon/ssi-sdk.oid4vci-holder';
import {_ExtendedIKey} from '@veramo/utils';
import {JWTHeader} from 'did-jwt';
import {DIDDocument} from 'did-resolver';
import {v4 as uuidv4} from 'uuid';
import {agentContext, ibCredentialLocaleBrandingFrom} from '../../agent';
import {translate} from '../../localization/Localization';
import {getOrCreatePrimaryIdentifier} from '../../services/identityService';
import {signJWT} from '../../services/signatureService';
import {
  ErrorDetails,
  IGetIssuanceInitiationFromUriArgs,
  IIssuanceOpts,
  IServerMetadataAndCryptoMatchingResponse,
  OID4VCIError,
  QrTypesEnum,
  SupportedDidMethodEnum,
} from '../../types';
import {KeyTypeFromCryptographicSuite, SignatureAlgorithmFromKey} from '../../utils';
import {credentialLocaleBrandingFrom} from '../../utils/mappers/branding/OIDC4VCIBrandingMapper';

// TODO these preferences need to come from the user
export const vcFormatPreferences = ['jwt_vc_json', 'jwt_vc', 'ldp_vc'];

export type JsonLdSignatureSuite = 'Ed25519Signature2018' | 'EcdsaSecp256k1Signature2019' | 'Ed25519Signature2020' | 'JsonWebSignature2020'; //|
// "JcsEd25519Signature2020"

export enum LDPProofTypeEnum {
  Ed25519Signature2018 = 'Ed25519Signature2018',
  EcdsaSecp256k1Signature2019 = 'EcdsaSecp256k1Signature2019',
  Ed25519Signature2020 = 'Ed25519Signature2020',
  JsonWebSignature2020 = 'JsonWebSignature2020',
  JcsEd25519Signature2020 = 'JcsEd25519Signature2020',
}

export const didMethodPreferences = [SupportedDidMethodEnum.DID_KEY, SupportedDidMethodEnum.DID_JWK, SupportedDidMethodEnum.DID_ION];

export const jsonldCryptographicSuitePreferences = [
  'Ed25519Signature2018',
  'EcdsaSecp256k1Signature2019',
  'Ed25519Signature2020',
  'JsonWebSignature2020',
  // "JcsEd25519Signature2020"
];

export enum SignatureAlgorithmEnum {
  EdDSA = 'EdDSA',
  ES256 = 'ES256',
  ES256K = 'ES256K',
}

export const jwtCryptographicSuitePreferences = [SignatureAlgorithmEnum.ES256, SignatureAlgorithmEnum.ES256K, SignatureAlgorithmEnum.EdDSA];

export interface IErrorDetailsOpts {
  title?: string;
  message?: string;
  detailsMessage?: string;
}

export interface CredentialToAccept {
  id?: string;
  issuanceOpt: IIssuanceOpts;
  credentialResponse: CredentialResponse;
}

class OpenId4VcIssuanceProvider {
  public static getErrorDetails = (error: OID4VCIError | string, opts?: IErrorDetailsOpts): ErrorDetails => {
    // We want to move this over to some general error handling within the app
    const genericError = {
      title: opts?.title ?? translate('error_generic_title'),
      message: opts?.message ?? translate('error_generic_message'),
      detailsMessage: `<b>${opts?.detailsMessage ?? translate('error_details_generic_message')}</b>`,
    };

    switch (error) {
      case OID4VCIError.INVALID_REQUEST:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_invalid_request'),
        };
      case OID4VCIError.INVALID_CLIENT:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_invalid_client'),
        };
      case OID4VCIError.INVALID_GRANT:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_invalid_grant'),
        };
      case OID4VCIError.UNAUTHORIZED_CLIENT:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_unauthorized_client'),
        };
      case OID4VCIError.UNSUPPORTED_GRANT_TYPE:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_unsupported_grant_type'),
        };
      case OID4VCIError.INVALID_SCOPE:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_unsupported_invalid_scope'),
        };
      case OID4VCIError.INVALID_OR_MISSING_PROOF:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_invalid_or_missing_proof'),
        };
      case OID4VCIError.VERIFICATION_FAILED:
        return {
          ...genericError,
          detailsTitle: translate('credential_verification_failed_message'),
        };
      default:
        return {
          ...genericError,
          detailsTitle: translate('error_details_generic_title'),
        };
    }
  };
  private readonly _client: OpenID4VCIClient;
  private _serverMetadata?: EndpointMetadataResult;
  private _credentialsSupported?: Array<CredentialSupported>;
  private _issuanceOpts?: Array<IIssuanceOpts>;
  private _accessTokenResponse?: AccessTokenResponse;
  private _credentialBranding?: Map<string, Array<IBasicCredentialLocaleBranding>>;
  private _issuerBranding?: Array<MetadataDisplay>;
  private _authorizationCodeResponse?: AuthorizationResponse;

  public constructor(client?: OpenID4VCIClient) {
    if (client) {
      this._client = client;
    }
  }

  get authorizationCodeResponse(): AuthorizationResponse | undefined {
    return this._authorizationCodeResponse;
  }

  set authorizationCodeResponse(value: AuthorizationResponse | string | undefined) {
    console.log('before setting authorizationCodeResponse', value);
    this._authorizationCodeResponse = typeof value === 'string' ? toAuthorizationResponsePayload(value) : value;
    console.log('after setting authorizationCodeResponse', JSON.stringify(this._authorizationCodeResponse));
  }

  get client(): OpenID4VCIClient {
    return this._client;
  }

  public static getIssuerDisplays(metadata: CredentialIssuerMetadata | IssuerMetadataV1_0_08, opts?: {prefLocales: string[]}): MetadataDisplay[] {
    const matchedDisplays: Array<MetadataDisplay> =
      metadata.display?.filter(
        (display: MetadataDisplay) =>
          !opts?.prefLocales || opts.prefLocales.length === 0 || (display.locale && opts.prefLocales.includes(display.locale)) || !display.locale,
      ) ?? [];
    return matchedDisplays.sort((display: MetadataDisplay): number =>
      display.locale ? opts?.prefLocales.indexOf(display.locale) ?? 1 : Number.MAX_VALUE,
    );
  }

  /**
   * TODO check again when WAL-617 is done to replace how we get the issuer name.
   */
  public static getIssuerName(
    url: string,
    credentialIssuerMetadata?: Partial<AuthorizationServerMetadata> & (CredentialIssuerMetadata | IssuerMetadataV1_0_08),
  ): string {
    if (credentialIssuerMetadata) {
      const displays: Array<MetadataDisplay> = credentialIssuerMetadata ? OpenId4VcIssuanceProvider.getIssuerDisplays(credentialIssuerMetadata) : [];
      for (const display of displays) {
        if (display.name) {
          return display.name;
        }
      }
    }

    return url;
  }

  get serverMetadata(): EndpointMetadataResult | undefined {
    return this._serverMetadata;
  }

  get credentialsSupported(): Array<CredentialSupported> | undefined {
    return this._credentialsSupported;
  }

  get credentialBranding(): Map<string, Array<IBasicCredentialLocaleBranding>> | undefined {
    return this._credentialBranding;
  }

  get issuanceOpts(): Array<IIssuanceOpts> | undefined {
    return this._issuanceOpts;
  }

  get issuerBranding(): Array<MetadataDisplay> | undefined {
    return this._issuerBranding;
  }

  get accessTokenResponse(): AccessTokenResponse | undefined {
    return this._accessTokenResponse;
  }

  public static initiationFromUri = async ({uri}: IGetIssuanceInitiationFromUriArgs): Promise<OpenId4VcIssuanceProvider> => {
    if (!uri || !(uri.startsWith(QrTypesEnum.OPENID_INITIATE_ISSUANCE) || uri.startsWith(QrTypesEnum.OPENID_CREDENTIAL_OFFER))) {
      return Promise.reject(Error('Invalid Uri'));
    }

    const client = await OpenID4VCIClient.fromURI({
      uri,
      authorizationRequest: {redirectUri: `${DefaultURISchemes.CREDENTIAL_OFFER}://`},
    });
    const provider: OpenId4VcIssuanceProvider = new OpenId4VcIssuanceProvider(client);

    await provider.getServerMetadataAndPerformCryptoMatching();

    return provider;
  };

  public getCredentials = async (args: GetCredentialsArgs): Promise<Array<CredentialToAccept>> => {
    console.log('CALLING: getCredentials');
    const {pin, credentials, openID4VCIClientState} = args;

    const client = await OpenID4VCIClient.fromState({state: openID4VCIClientState});

    if (client) {
      console.log('CALLING: getCredentials HAS client');
    }

    const matches: IServerMetadataAndCryptoMatchingResponse = await this.getServerMetadataAndPerformCryptoMatching(client);
    const credentialResponses: Array<CredentialToAccept> = [];
    // const initTypes = this.client.getCredentialTypes();
    for (const issuanceOpt of matches.issuanceOpts) {
      /*  if (!initTypes.includes(credentialType)) {
        continue;
      }*/
      const credentialResponse: CredentialResponse = await this.getCredential({
        issuanceOpt,
        pin,
        client,
      });
      credentialResponses.push({
        id: issuanceOpt.id,
        issuanceOpt,
        credentialResponse,
      });
    }

    if (credentialResponses.length === 0) {
      return Promise.reject(Error('Could not get credentials from issuance and match them on supported types.'));
    }

    return credentialResponses;
  };

  public getCredential = async ({
    issuanceOpt,
    pin,
    client,
  }: {
    pin?: string;
    issuanceOpt: IIssuanceOpts;
    client?: OpenID4VCIClient;
  }): Promise<CredentialResponse> => {
    console.log('CALLING: getCredential');
    const clientInstance = client ?? this.client;

    if (client) {
      console.log('CALLING: getCredential HAS client');
    }

    if (!issuanceOpt) {
      return Promise.reject(Error(`Cannot get credential issuance options`));
    }
    const identifier = await getOrCreatePrimaryIdentifier({
      method: issuanceOpt.didMethod,
      createOpts: {options: {type: issuanceOpt.keyType, use: KeyUse.Signature}},
    });
    const key: _ExtendedIKey =
      (await getFirstKeyWithRelation(identifier, agentContext, 'authentication', false)) ||
      ((await getFirstKeyWithRelation(identifier, agentContext, 'verificationMethod', true)) as _ExtendedIKey);
    const kid: string = key.meta.verificationMethod.id;
    const alg: SignatureAlgorithmEnum = SignatureAlgorithmFromKey(key);

    const callbacks: ProofOfPossessionCallbacks<DIDDocument> = {
      signCallback: (jwt: Jwt, kid?: string) => {
        let iss = jwt.payload.iss;
        if (this.isEbsi()) {
          iss = jwt.header.kid?.split('#')[0];
        }
        if (!iss) {
          iss = jwt.header.kid?.split('#')[0];
        }
        if (!iss) {
          throw Error(`No issuer could be determined from the JWT ${JSON.stringify(jwt)}`);
        }
        const header = {...jwt.header, kid} as Partial<JWTHeader>;
        const payload = {...jwt.payload, ...(iss && {iss})};
        console.log(`header: ${JSON.stringify(header)}`);
        console.log(`payload: ${JSON.stringify(payload)}`);
        return signJWT({
          identifier,
          header,
          payload,
          options: {issuer: iss, expiresIn: jwt.payload.exp, canonicalize: false},
        });
      },
    };

    try {
      // We need to make sure we have acquired the access token
      await this.acquireAccessToken({pin, authorizationResponse: this.authorizationCodeResponse, client: clientInstance});
      // @ts-ignore
      console.log(`cred type: ${JSON.stringify(issuanceOpt.types)}, format: ${issuanceOpt.format}, kid: ${kid}, alg: ${alg}`);

      return await clientInstance.acquireCredentials({
        // @ts-ignore
        credentialTypes: issuanceOpt.types /*.filter((type: string): boolean => type !== 'VerifiableCredential')*/,
        proofCallbacks: callbacks,
        format: issuanceOpt.format,
        // TODO: We need to update the machine and add notifications support for actual deferred credentials instead of just waiting/retrying
        deferredCredentialAwait: true,
        kid,
        alg,
        jti: uuidv4(),
      });
    } catch (error) {
      console.log(`Unable to get credential: ${error}`);
      return Promise.reject(error);
    }
  };

  // TODO object args
  public getServerMetadataAndPerformCryptoMatching = async (client?: OpenID4VCIClient): Promise<IServerMetadataAndCryptoMatchingResponse> => {
    const clientInstance = client ?? this.client; // TODO name

    if (!this._serverMetadata) {
      this._serverMetadata = await clientInstance.retrieveServerMetadata();
    }
    if (!this._credentialsSupported || this._credentialsSupported.length === 0) {
      // todo: remove format here. This is just a temp hack for V11+ issuance of only one credential. Having a single array with formats for multiple credentials will not work. This should be handled in VCI itself
      let format: string[] | undefined = undefined;
      if (clientInstance.version() > OpenId4VCIVersion.VER_1_0_09 && typeof clientInstance.credentialOffer?.credential_offer === 'object') {
        format = clientInstance
          .credentialOffer!.credential_offer.credentials // TODO null ref
          .filter((format: string | CredentialOfferFormat): boolean => typeof format !== 'string')
          .map((format: string | CredentialOfferFormat) => (format as CredentialOfferFormat).format);
        if (format.length === 0) {
          format = undefined; // Otherwise we would match nothing
        }
      }
      this._credentialsSupported = await this.getPreferredCredentialFormats(
        clientInstance.getCredentialsSupported(!!clientInstance.credentialOffer?.credential_offer, format),
      );
      if (!this._credentialsSupported || this._credentialsSupported.length === 0) {
        this._credentialsSupported = clientInstance.credentialOffer?.credential_offer.credentials
          .filter((format: string | CredentialOfferFormat): boolean => typeof format !== 'string')
          .map(cred => {
            return {
              format: (<CredentialOfferFormat>cred).format,
              // @ts-ignore
              types: (<CredentialOfferFormat>cred).types,
            } as CredentialSupported;
          });
      }
    }

    if (!this._issuerBranding) {
      this._issuerBranding = this._serverMetadata.credentialIssuerMetadata?.display;
    }

    if (!this._credentialBranding) {
      this._credentialBranding = new Map<string, Array<IBasicCredentialLocaleBranding>>();
      await Promise.all(
        // @ts-ignore
        this._credentialsSupported.map(async (metadata: CredentialSupported): Promise<void> => {
          const localeBranding: Array<IBasicCredentialLocaleBranding> = await Promise.all(
            (metadata.display ?? []).map(
              async (display: CredentialsSupportedDisplay): Promise<IBasicCredentialLocaleBranding> =>
                await ibCredentialLocaleBrandingFrom({localeBranding: await credentialLocaleBrandingFrom(display)}),
            ),
          );

          const credentialTypes: Array<string> =
            // @ts-ignore
            metadata.types.length > 1
              ? // @ts-ignore
                metadata.types.filter((type: string): boolean => type !== 'VerifiableCredential')
              : // @ts-ignore
              metadata.types.length === 0
              ? ['VerifiableCredential']
              : // @ts-ignore
                metadata.types;

          if (this._credentialBranding) {
            this._credentialBranding.set(credentialTypes[0], localeBranding); // TODO for now taking the first type
          }
        }),
      );
    }

    return {
      issuerBranding: this._issuerBranding,
      serverMetadata: this._serverMetadata,
      // @ts-ignore
      credentialsSupported: this._credentialsSupported,
      issuanceOpts: await this.getIssuanceOpts(),
      credentialBranding: this._credentialBranding,
    };
  };

  public acquireAccessToken = async (opts: {
    pin?: string;
    clientId?: string;
    authorizationResponse?: AuthorizationResponse;
    client?: OpenID4VCIClient;
  }): Promise<AccessTokenResponse> => {
    console.log('CALLING: acquireAccessToken');

    const {pin, client} = opts;

    if (client) {
      console.log('CALLING: acquireAccessToken HAS client');
    }

    const clientInstance = client ?? this.client;
    if (!this._accessTokenResponse) {
      const clientId: string | undefined = opts.clientId;
      console.log('CALLING: acquireAccessToken ON CLIENT');
      this._accessTokenResponse = await clientInstance.acquireAccessToken({
        pin,
        clientId,
        authorizationResponse: opts?.authorizationResponse ?? this.authorizationCodeResponse,
      });
      console.log(`OpenId4VcIssuanceProvider.accessTokenResponse accessTokenResponse: ${JSON.stringify(this._accessTokenResponse)}`);
    }
    return this._accessTokenResponse;
  };

  private getPreferredCredentialFormats = async (credentials: Array<CredentialSupported>): Promise<Array<CredentialSupported>> => {
    // Group credentials based on types as we now have multiple entries for one vc with different formats
    const groupedTypes: Array<any> = Array.from(
      // TODO any
      credentials
        .reduce(
          // @ts-ignore
          (map: Map<any, any>, value: CredentialSupported) => map.set(value.types.toString(), [...(map.get(value.types.toString()) || []), value]),
          new Map(),
        )
        .values(),
    );

    const preferredCredentials: Array<CredentialSupported> = [];

    for (const group of groupedTypes) {
      for (const vcFormatPreference of vcFormatPreferences) {
        const credentialSupported = group.find(
          (credentialSupported: CredentialSupported): boolean => credentialSupported.format === vcFormatPreference,
        );
        if (credentialSupported) {
          preferredCredentials.push(credentialSupported);
          break;
        }
      }
    }

    return preferredCredentials;
  };

  private getIssuanceOpts = async (): Promise<Array<IIssuanceOpts>> => {
    if (this._issuanceOpts && this._issuanceOpts.length > 0) {
      return this._issuanceOpts;
    }
    if (!this._credentialsSupported) {
      return Promise.reject(Error('No credentials supported'));
    }
    const issuanceOpts: Array<IIssuanceOpts> = [];

    for (const credentialSupported of this._credentialsSupported) {
      if (!this._serverMetadata?.credentialIssuerMetadata) {
        issuanceOpts.push(this.defaultIssuanceOpts(credentialSupported));
        continue;
      }

      const cryptographicSuite: string = await this.getIssuanceCryptoSuite({credentialSupported});
      const didMethod: SupportedDidMethodEnum = await this.getIssuanceDidMethod(credentialSupported);

      issuanceOpts.push({
        ...credentialSupported,
        didMethod,
        format: credentialSupported.format,
        keyType: KeyTypeFromCryptographicSuite(cryptographicSuite),
      } as IIssuanceOpts);
    }

    this._issuanceOpts = issuanceOpts;
    return this._issuanceOpts;
  };

  private defaultIssuanceOpts(credentialSupported: CredentialSupported): IIssuanceOpts {
    console.log(
      `WARNING: Reverting to default for key/signature suites for credential type '${JSON.stringify(
        // @ts-ignore
        credentialSupported.types,
      )}', as no Server Metadata or no metadata match was present!`,
    );
    return {
      ...credentialSupported,
      didMethod: SupportedDidMethodEnum.DID_JWK,
      keyType: 'Secp256k1',
    };
  }

  private getIssuanceCryptoSuite = async ({credentialSupported}: {credentialSupported: CredentialSupported}): Promise<string> => {
    const suites_supported: Array<string> = credentialSupported.cryptographic_suites_supported ?? [];

    // TODO: Return array, so the wallet/user could choose
    switch (credentialSupported.format) {
      // @ts-ignore
      case 'jwt':
      case 'jwt_vc_json':
      case 'jwt_vc': {
        const supportedPreferences: Array<SignatureAlgorithmEnum> = jwtCryptographicSuitePreferences.filter((suite: SignatureAlgorithmEnum) =>
          suites_supported.includes(suite),
        );

        if (supportedPreferences.length > 0) {
          return supportedPreferences[0];
        } else if (this.isEbsi()) {
          return SignatureAlgorithmEnum.ES256;
        }

        // if we cannot find supported cryptographic suites, we just try with the first preference
        const fallback = jwtCryptographicSuitePreferences[0];
        console.log(`Warn: We could not determine the crypto suites from the server metadata, and will fallback to a default: ${fallback}`);
        return fallback;
      }
      // @ts-ignore
      case 'ldp':
      // @ts-ignore
      case 'jwt_vc_json_ld':
      case 'ldp_vc': {
        const supportedPreferences: Array<string> = jsonldCryptographicSuitePreferences.filter((suite: string) => suites_supported.includes(suite));
        if (supportedPreferences.length > 0) {
          return supportedPreferences[0];
        }

        // if we cannot find supported cryptographic suites, we just try with the first preference
        const fallback = jsonldCryptographicSuitePreferences[0];
        console.log(`Warn: We could not determine the crypto suites from the server metadata, and will fallback to a default: ${fallback}`);
        return fallback;
      }
      default:
        return Promise.reject(Error(`Credential format '${credentialSupported.format}' not supported`));
    }
  };

  private isEbsi() {
    if (
      this.client.credentialOffer?.credential_offer.credentials.find(
        // @ts-ignore
        cred => typeof cred !== 'string' && 'trust_framework' in cred && 'name' in cred.trust_framework && cred.trust_framework.name.includes('ebsi'),
      )
    ) {
      return true;
    }
    return this.serverMetadata?.authorization_endpoint?.includes('ebsi.eu');
  }

  private getIssuanceDidMethod = async (credentialSupported: CredentialSupported): Promise<SupportedDidMethodEnum> => {
    const {format, cryptographic_binding_methods_supported} = credentialSupported;
    if (cryptographic_binding_methods_supported && Array.isArray(cryptographic_binding_methods_supported)) {
      const method: SupportedDidMethodEnum | undefined = didMethodPreferences.find((method: SupportedDidMethodEnum) =>
        cryptographic_binding_methods_supported.includes(`did:${method.toLowerCase().replace('did:', '')}`),
      );
      if (method) {
        return method;
      } else if (cryptographic_binding_methods_supported.includes('did')) {
        return format ? didMethodPreferences[1] : didMethodPreferences[0];
      }
    }

    if (this.isEbsi()) {
      return SupportedDidMethodEnum.DID_KEY;
    }
    if (!format || (format.includes('jwt') && !format?.includes('jwt_vc_json_ld'))) {
      return format ? didMethodPreferences[1] : didMethodPreferences[0];
    } else {
      // JsonLD
      return didMethodPreferences[0];
    }
  };
}

export default OpenId4VcIssuanceProvider;
