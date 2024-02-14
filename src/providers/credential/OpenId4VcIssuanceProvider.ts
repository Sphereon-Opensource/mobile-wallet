import {OpenID4VCIClient} from '@sphereon/oid4vci-client';
import {
  AccessTokenResponse,
  AuthorizationResponse,
  CredentialOfferFormat,
  CredentialResponse,
  CredentialsSupportedDisplay,
  CredentialSupported,
  DefaultURISchemes,
  EndpointMetadataResult,
  Jwt,
  MetadataDisplay,
  OpenId4VCIVersion,
  ProofOfPossessionCallbacks,
  toAuthorizationResponsePayload,
} from '@sphereon/oid4vci-common';
import {KeyUse} from '@sphereon/ssi-sdk-ext.did-resolver-jwk';
import {getFirstKeyWithRelation} from '@sphereon/ssi-sdk-ext.did-utils';
import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {IIdentifier} from '@veramo/core';
import {_ExtendedIKey} from '@veramo/utils';
import Debug, {Debugger} from 'debug';
import {JWTHeader} from 'did-jwt';
import {DIDDocument} from 'did-resolver';
import {APP_ID} from '../../@config/constants';
import {agentContext, ibCredentialLocaleBrandingFrom} from '../../agent';
import {translate} from '../../localization/Localization';
import {getOrCreatePrimaryIdentifier} from '../../services/identityService';
import {signJWT} from '../../services/signatureService';
import {
  ErrorDetails,
  IGetCredentialsArgs,
  IGetIssuanceInitiationFromUriArgs,
  IIssuanceOpts,
  IServerMetadataAndCryptoMatchingResponse,
  OID4VCIError,
  QrTypesEnum,
  SupportedDidMethodEnum,
} from '../../types';
// FIXME: This file needs a complete overhaul. Much needs to move the SDK and should be called by xstate
import {KeyTypeFromCryptographicSuite, SignatureAlgorithmFromKey} from '../../utils/KeyUtils';
import {credentialLocaleBrandingFrom} from '../../utils/mappers/branding/OIDC4VCIBrandingMapper';

const {v4: uuidv4} = require('uuid');
const debug: Debugger = Debug(`${APP_ID}:openid4vci`);

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
const arrayEqualsIgnoreOrder = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const uniqueValues = new Set([...a, ...b]);
  for (const v of uniqueValues) {
    const aCount = a.filter(e => e === v).length;
    const bCount = b.filter(e => e === v).length;
    if (aCount !== bCount) return false;
  }
  return true;
};

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

  private constructor(client: OpenID4VCIClient) {
    this._client = client;
  }

  get authorizationCodeResponse(): AuthorizationResponse | undefined {
    return this._authorizationCodeResponse;
  }
  set authorizationCodeResponse(value: AuthorizationResponse | string | undefined) {
    this._authorizationCodeResponse = typeof value === 'string' ? toAuthorizationResponsePayload(value) : value;
    debug('authorizationCodeResponse has been set', JSON.stringify(this._authorizationCodeResponse));
  }

  get client(): OpenID4VCIClient {
    return this._client;
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

  public getCredentials = async ({pin, credentials}: IGetCredentialsArgs): Promise<Array<CredentialToAccept>> => {
    const matches: IServerMetadataAndCryptoMatchingResponse = await this.getServerMetadataAndPerformCryptoMatching();
    const selectedCredentials = credentials;
    const credentialResponses: Array<CredentialToAccept> = [];
    // const initTypes = this.client.getCredentialTypes();
    for (const issuanceOpt of matches.issuanceOpts) {
      /*  if (!initTypes.includes(credentialType)) {
        continue;
      }*/
      const credentialResponse: CredentialResponse = await this.getCredential({
        issuanceOpt,
        pin,
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

  private getIdentifier = async ({issuanceOpt}: {issuanceOpt: IIssuanceOpts}) => {
    const identifier = await getOrCreatePrimaryIdentifier({
      method: issuanceOpt.didMethod,
      createOpts: {options: {type: issuanceOpt.keyType, use: KeyUse.Signature, codecName: issuanceOpt.codecName}},
    });
    const key: _ExtendedIKey = await this.getAuthenticationKey(identifier);
    const kid: string = key.meta.verificationMethod.id;
    return {identifier, key, kid};
  };

  private async getAuthenticationKey(identifier: IIdentifier) {
    return (
      (await getFirstKeyWithRelation(identifier, agentContext, 'authentication', false)) ||
      ((await getFirstKeyWithRelation(identifier, agentContext, 'verificationMethod', true)) as _ExtendedIKey)
    );
  }

  public getCredential = async ({issuanceOpt, pin}: {pin?: string; issuanceOpt: IIssuanceOpts}): Promise<CredentialResponse> => {
    if (!issuanceOpt) {
      return Promise.reject(Error(`Cannot get credential issuance options`));
    }
    const {identifier, kid} = issuanceOpt;
    const key = await this.getAuthenticationKey(identifier);
    const alg: SignatureAlgorithmEnum = SignatureAlgorithmFromKey(key);

    const callbacks: ProofOfPossessionCallbacks<DIDDocument> = {
      signCallback: (jwt: Jwt, kid?: string) => {
        let iss = jwt.payload.iss;
        if (this.client.isEBSI()) {
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
        debug('header:', JSON.stringify(header));
        debug('payload:', JSON.stringify(payload));
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
      await this.acquireAccessToken({pin, authorizationResponse: this.authorizationCodeResponse});

      debug(`credential type: ${JSON.stringify(issuanceOpt.types)}, format: ${issuanceOpt.format}, kid: ${kid}, alg: ${alg}`);

      // @ts-ignore
      return await this._client.acquireCredentials({
        credentialTypes: issuanceOpt.types /*.filter((type: string): boolean => type !== 'VerifiableCredential')*/,
        ...('@context' in issuanceOpt && issuanceOpt['@context'] && {context: issuanceOpt['@context']}),
        proofCallbacks: callbacks,
        format: issuanceOpt.format,
        // TODO: We need to update the machine and add notifications support for actuall deferred credentials instead of just waiting/retrying
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

  public async setCredentialsSupported() {
    if (!this._credentialsSupported || this._credentialsSupported.length === 0) {
      // todo: remove format here. This is just a temp hack for V11+ issuance of only one credential. Having a single array with formats for multiple credentials will not work. This should be handled in VCI itself
      let format: string[] | undefined = undefined;
      if (this._client.version() > OpenId4VCIVersion.VER_1_0_09 && typeof this._client.credentialOffer?.credential_offer === 'object') {
        format = this._client.credentialOffer.credential_offer.credentials
          .filter((format: string | CredentialOfferFormat): boolean => typeof format !== 'string')
          .map((format: string | CredentialOfferFormat) => (format as CredentialOfferFormat).format);
        if (format.length === 0) {
          format = undefined; // Otherwise we would match nothing
        }
      }
      // This restricts to initiation types when there is an offer
      this._credentialsSupported = await this.getPreferredCredentialFormats(
        this._client.getCredentialsSupported(!!this._client.credentialOffer?.credential_offer, format),
      );
      if (!this._credentialsSupported || this._credentialsSupported.length === 0) {
        this._credentialsSupported = this._client.credentialOffer?.credential_offer.credentials
          .filter((format: string | CredentialOfferFormat): boolean => typeof format !== 'string')
          .map(cred => {
            return {
              format: (<CredentialOfferFormat>cred).format,
              types: (<CredentialOfferFormat>cred).types,
            } as CredentialSupported;
          });
      }
    }
  }

  public getServerMetadataAndPerformCryptoMatching = async (): Promise<IServerMetadataAndCryptoMatchingResponse> => {
    if (!this._serverMetadata) {
      this._serverMetadata = await this._client.retrieveServerMetadata();
    }
    if (!this._credentialsSupported || this._credentialsSupported.length === 0) {
      await this.setCredentialsSupported();
    }

    if (!this._issuerBranding) {
      this._issuerBranding = this._serverMetadata.credentialIssuerMetadata?.display;
    }

    if (!this._credentialBranding) {
      this._credentialBranding = new Map<string, Array<IBasicCredentialLocaleBranding>>();
      await Promise.all(
        this._credentialsSupported!.map(async (metadata: CredentialSupported): Promise<void> => {
          const localeBranding: Array<IBasicCredentialLocaleBranding> = await Promise.all(
            (metadata.display ?? []).map(
              async (display: CredentialsSupportedDisplay): Promise<IBasicCredentialLocaleBranding> =>
                await ibCredentialLocaleBrandingFrom({localeBranding: await credentialLocaleBrandingFrom(display)}),
            ),
          );

          const credentialTypes: Array<string> =
            metadata.types.length > 1
              ? metadata.types.filter((type: string): boolean => type !== 'VerifiableCredential')
              : metadata.types.length === 0
              ? ['VerifiableCredential']
              : metadata.types;

          if (this._credentialBranding) {
            this._credentialBranding.set(credentialTypes[0], localeBranding); // TODO for now taking the first type
          }
        }),
      );
    }

    return {
      issuerBranding: this._issuerBranding,
      serverMetadata: this._serverMetadata,
      credentialsSupported: this._credentialsSupported,
      issuanceOpts: await this.getIssuanceOpts(),
      credentialBranding: this._credentialBranding,
    };
  };

  public acquireAccessToken = async (opts: {
    pin?: string;
    clientId?: string;
    authorizationResponse?: AuthorizationResponse;
  }): Promise<AccessTokenResponse> => {
    const {pin} = opts;
    if (!this._accessTokenResponse) {
      const clientId: string | undefined = opts.clientId;
      this._accessTokenResponse = await this._client.acquireAccessToken({
        pin,
        clientId,
        authorizationResponse: opts?.authorizationResponse ?? this.authorizationCodeResponse,
      });
      debug(`OpenId4VcIssuanceProvider.accessTokenResponse accessTokenResponse:`, JSON.stringify(this._accessTokenResponse));
    }
    return this._accessTokenResponse;
  };

  private getPreferredCredentialFormats = async (credentials: Array<CredentialSupported>): Promise<Array<CredentialSupported>> => {
    // Group credentials based on types as we now have multiple entries for one vc with different formats
    const groupedTypes: Array<any> = Array.from(
      // TODO any
      credentials
        .reduce(
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
      const issuanceOpt = {
        ...credentialSupported,
        didMethod,
        format: credentialSupported.format,
        keyType: this.client.isEBSI() ? 'Secp256r1' : KeyTypeFromCryptographicSuite(cryptographicSuite),
        ...(this.client.isEBSI() && {codecName: 'EBSI'}),
      } as IIssuanceOpts;
      const identifierOpts = await this.getIdentifier({issuanceOpt});
      if (!this.client.clientId || this.client.clientId) {
        // FIXME: We really should fetch server metadata. Have user select required credentials. Take the first cred to determine a kid when no clientId is present and set that.
        //  Needs a preference service for crypto, keys, dids, and clientId, with ecosystem support
        console.log(`################################Setting client id to ${identifierOpts.identifier.did}`);
        this.client.clientId = identifierOpts.identifier.did;
      }

      issuanceOpts.push({...issuanceOpt, ...identifierOpts});
    }

    this._issuanceOpts = issuanceOpts;

    return this._issuanceOpts;
  };

  private defaultIssuanceOpts(credentialSupported: CredentialSupported): IIssuanceOpts {
    console.log(
      `WARNING: Reverting to default for key/signature suites for credential type '${JSON.stringify(
        credentialSupported.types,
      )}', as no Server Metadata or no metadata match was present!`,
    );
    const issuanceOpt = {
      ...credentialSupported,
      didMethod: this.client.isEBSI() ? SupportedDidMethodEnum.DID_KEY : SupportedDidMethodEnum.DID_JWK,
      keyType: 'Secp256r1',
    } as IIssuanceOpts;
    const identifierOpts = this.getIdentifier({issuanceOpt});

    return {...issuanceOpt, ...identifierOpts};
  }

  private getIssuanceCryptoSuite = async ({credentialSupported}: {credentialSupported: CredentialSupported}): Promise<string> => {
    const suites_supported: Array<string> = credentialSupported.cryptographic_suites_supported ?? [];

    // TODO: Return array, so the wallet/user could choose
    switch (credentialSupported.format) {
      case 'jwt':
      case 'jwt_vc_json':
      case 'jwt_vc': {
        const supportedPreferences: Array<SignatureAlgorithmEnum> = jwtCryptographicSuitePreferences.filter((suite: SignatureAlgorithmEnum) =>
          suites_supported.includes(suite),
        );

        if (supportedPreferences.length > 0) {
          return supportedPreferences[0];
        } else if (this.client.isEBSI()) {
          return SignatureAlgorithmEnum.ES256;
        }

        // if we cannot find supported cryptographic suites, we just try with the first preference
        const fallback = jwtCryptographicSuitePreferences[0];
        console.log(`Warn: We could not determine the crypto suites from the server metadata, and will fallback to a default: ${fallback}`);
        return fallback;
      }
      case 'ldp':
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

    if (this.client.isEBSI()) {
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
