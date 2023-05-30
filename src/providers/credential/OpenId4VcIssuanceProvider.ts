import {OpenID4VCIClient} from '@sphereon/oid4vci-client';
import {
  AccessTokenResponse,
  AuthzFlowType,
  CredentialResponse,
  CredentialSupported,
  EndpointMetadata,
  Jwt,
  OID4VCICredentialFormat,
  ProofOfPossessionCallbacks
} from '@sphereon/oid4vci-common';
import {getFirstKeyWithRelation} from '@sphereon/ssi-sdk-did-utils';
import {KeyUse} from '@sphereon/ssi-sdk-jwk-did-provider';
import {CredentialFormat} from '@sphereon/ssi-types';
import {_ExtendedIKey} from '@veramo/utils';

import {APP_ID} from '../../@config/constants';
import {agentContext} from '../../agent';
import {translate} from '../../localization/Localization';
import {getOrCreatePrimaryIdentifier} from '../../services/identityService';
import {signJWT} from '../../services/signatureService';
import {
  IErrorDetails,
  IGetCredentialArgs,
  IGetCredentialsArgs,
  IGetIssuanceInitiationFromUriArgs,
  IIssuanceOpts,
  IServerMetadataAndCryptoMatchingResponse,
  Oidc4vciErrorEnum,
  QrTypesEnum,
  SupportedDidMethodEnum,
} from '../../types';
import {KeyTypeFromCryptographicSuite, SignatureAlgorithmFromKey} from '../../utils/KeyUtils';

const {v4: uuidv4} = require('uuid');

const debug = console.log(`${APP_ID}:openid4vci`);

// TODO these preferences need to come from the user
export const vcFormatPreferences = ['jwt_vc', 'ldp_vc'];

export type JsonLdSignatureSuite = 'Ed25519Signature2018' | 'EcdsaSecp256k1Signature2019' | 'Ed25519Signature2020' | 'JsonWebSignature2020'; //|
// "JcsEd25519Signature2020"

export enum LDPProofTypeEnum {
  Ed25519Signature2018 = 'Ed25519Signature2018',
  EcdsaSecp256k1Signature2019 = 'EcdsaSecp256k1Signature2019',
  Ed25519Signature2020 = 'Ed25519Signature2020',
  JsonWebSignature2020 = 'JsonWebSignature2020',
  JcsEd25519Signature2020 = 'JcsEd25519Signature2020',
}

export const didMethodPreferences = [SupportedDidMethodEnum.DID_KEY, SupportedDidMethodEnum.DID_JWK];

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

export const jwtCryptographicSuitePreferences = [SignatureAlgorithmEnum.ES256K, SignatureAlgorithmEnum.ES256, SignatureAlgorithmEnum.EdDSA];

export interface IErrorDetailsOpts {
  title?: string;
  message?: string;
  detailsMessage?: string;
}

export interface CredentialFromOffer {
  id?: string;
  issuanceOpt: IIssuanceOpts;
  credentialResponse: CredentialResponse;
}

class OpenId4VcIssuanceProvider {
  public static getErrorDetails = (error: Oidc4vciErrorEnum | string, opts?: IErrorDetailsOpts): IErrorDetails => {
    // We want to move this over to some general error handling within the app
    const genericError = {
      title: opts?.title ?? translate('error_generic_title'),
      message: opts?.message ?? translate('error_generic_message'),
      detailsMessage: `<b>${opts?.detailsMessage ?? translate('error_details_generic_message')}</b>`,
    };

    switch (error) {
      case Oidc4vciErrorEnum.INVALID_REQUEST:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_invalid_request'),
        };
      case Oidc4vciErrorEnum.INVALID_CLIENT:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_invalid_client'),
        };
      case Oidc4vciErrorEnum.INVALID_GRANT:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_invalid_grant'),
        };
      case Oidc4vciErrorEnum.UNAUTHORIZED_CLIENT:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_unauthorized_client'),
        };
      case Oidc4vciErrorEnum.UNSUPPORTED_GRANT_TYPE:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_unsupported_grant_type'),
        };
      case Oidc4vciErrorEnum.INVALID_SCOPE:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_unsupported_invalid_scope'),
        };
      case Oidc4vciErrorEnum.INVALID_OR_MISSING_PROOF:
        return {
          ...genericError,
          detailsTitle: translate('oidc4vci_error_invalid_or_missing_proof'),
        };
      case Oidc4vciErrorEnum.VERIFICATION_FAILED:
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
  private readonly client: OpenID4VCIClient;
  private serverMetadata: EndpointMetadata | undefined;
  private credentialsSupported: Array<CredentialSupported> | undefined;
  private issuanceOpts: Array<IIssuanceOpts> | undefined;
  private accessTokenResponse: AccessTokenResponse | undefined;

  private constructor(client: OpenID4VCIClient) {
    this.client = client;
  }

  public static initiationFromUri = async ({uri}: IGetIssuanceInitiationFromUriArgs): Promise<OpenId4VcIssuanceProvider> => {
    if (!uri || !(uri.startsWith(QrTypesEnum.OPENID_INITIATE_ISSUANCE) || uri.startsWith(QrTypesEnum.OPENID_CREDENTIAL_OFFER))) {
      console.log(`Invalid Uri: ${uri}`);
      return Promise.reject(Error('Invalid Uri'));
    }
    return new OpenId4VcIssuanceProvider(
      await OpenID4VCIClient.fromURI({
        uri,
        flowType: AuthzFlowType.PRE_AUTHORIZED_CODE_FLOW,
      }),
    );
  };

  public getCredentialsFromIssuance = async ({pin, credentials}: IGetCredentialsArgs): Promise<Array<CredentialFromOffer>> => {
    const matches = await this.getServerMetadataAndPerformCryptoMatching();
    const credentialResponses: Array<CredentialFromOffer> = [];
    // const initTypes = this.client.getCredentialTypes();
    for (const issuanceOpt of matches.issuanceOpts) {
    /*  if (!initTypes.includes(credentialType)) {
        continue;
      }*/
      const credentialResponse = await this.getCredential({
        issuanceOpt,
        pin,
      });
      credentialResponses.push({
        id: issuanceOpt.id,
        issuanceOpt,
        credentialResponse
      })
    }

    if (credentialResponses.length === 0) {
      return Promise.reject(Error('Could not get credentials from issuance and match them on supported types.'));
    }

    return credentialResponses;
  };

  public getCredential = async ({issuanceOpt, pin}: { pin?: string, issuanceOpt: IIssuanceOpts }): Promise<CredentialResponse> => {
    if (!issuanceOpt) {
      return Promise.reject(Error(`Cannot get credential issuance options`));
    }
    const identifier = await getOrCreatePrimaryIdentifier({
      method: issuanceOpt.didMethod,
      createOpts: {options: {type: issuanceOpt.keyType, use: KeyUse.Signature}},
    });
    const key =
      (await getFirstKeyWithRelation(identifier, agentContext, 'authentication', false)) ||
      ((await getFirstKeyWithRelation(identifier, agentContext, 'verificationMethod', true)) as _ExtendedIKey);
    const kid = key.meta.verificationMethod.id;
    const alg = SignatureAlgorithmFromKey(key);

    const callbacks: ProofOfPossessionCallbacks = {
      signCallback: (jwt: Jwt, kid?: string) => {
        console.log(`header: ${JSON.stringify({...jwt.header, typ: 'JWT', kid})}`);
        console.log(`payload: ${JSON.stringify({...jwt.payload})}`);
        return signJWT({
          identifier,
          header: {...jwt.header, typ: 'JWT', kid},
          payload: {...jwt.payload},
          // TODO fix non null assertion
          options: {issuer: jwt.payload.iss!, expiresIn: jwt.payload.exp, canonicalize: false},
        });
      },
    };

    try {
      // We need to make sure we have acquired the access token
      await this.acquireAccessToken({pin});

      console.log(`cred type: ${JSON.stringify(issuanceOpt.types)}, format: ${issuanceOpt.format}, kid: ${kid}, alg: ${alg}`);
      return await this.client.acquireCredentials({
        credentialTypes: issuanceOpt.types.filter(type => type !== 'VerifiableCredential'),
        proofCallbacks: callbacks,
        format: issuanceOpt.format,
        kid,
        alg,
        jti: uuidv4(),
      });
    } catch (error) {
      console.log(`Unable to get credential: ${error}`);
      return Promise.reject(error);
    }
  };

  private static determineClientId(issuer?: string) {
    //FIXME: Remove. Needs to move to party/connection management. Crossword expects a certain clientID
    return issuer !== undefined && issuer.includes('identiproof') ? 'default-pre-auth-client' : APP_ID;
  }

  public getServerMetadataAndPerformCryptoMatching = async (): Promise<IServerMetadataAndCryptoMatchingResponse> => {
    if (!this.serverMetadata) {
      this.serverMetadata = await this.client.retrieveServerMetadata();
    }
    if (!this.credentialsSupported || this.credentialsSupported.length===0) {
      this.credentialsSupported = this.client.getCredentialsSupported(true)
    }
    return {
      serverMetadata: this.serverMetadata,
      credentialsSupported: this.credentialsSupported,
      issuanceOpts: await this.getIssuanceOpts(),
    };
  };

  public acquireAccessToken = async ({pin}: {pin?: string}): Promise<AccessTokenResponse> => {
    if (!this.accessTokenResponse) {
      const clientId = OpenId4VcIssuanceProvider.determineClientId(this.serverMetadata?.issuer);
      this.accessTokenResponse = await this.client.acquireAccessToken({pin, clientId});
      console.log(`OpenId4VcIssuanceProvider.accessTokenResponse accessTokenResponse: ${this.accessTokenResponse}`);
    }
    return this.accessTokenResponse;
  };

  private getIssuanceOpts = async (): Promise<Array<IIssuanceOpts>> => {
    if (this.issuanceOpts && this.issuanceOpts.length > 0) {
      return this.issuanceOpts;
    }
    if (!this.credentialsSupported) {
      return Promise.reject(Error('No credentials supported'));
    }
    const issuanceOpts: Array<IIssuanceOpts> = [];

    for (const credentialSupported of this.credentialsSupported) {
      if (!this.serverMetadata?.issuerMetadata) {
        issuanceOpts.push(this.defaultIssuanceOpts(credentialSupported))
        continue;
      }

      const format = await this.getIssuanceCredentialFormat({credentialSupported});
      const cryptographicSuite: string = await this.getIssuanceCryptoSuite({credentialSupported});
      const didMethod: SupportedDidMethodEnum = await this.getIssuanceDidMethod(credentialSupported.format);

      issuanceOpts.push( {
        ...credentialSupported,
        didMethod,
        format,
        keyType: KeyTypeFromCryptographicSuite(cryptographicSuite)
      } as IIssuanceOpts)
    }

    this.issuanceOpts = issuanceOpts;
    return this.issuanceOpts;
  };

  private defaultIssuanceOpts(credentialSupported: CredentialSupported): IIssuanceOpts {
    console.log(
      `WARNING: Reverting to default for key/signature suites for credential type '${JSON.stringify(credentialSupported.types)}', as no Server Metadata or no metadata match was present!`,
    );
    return {
      ...credentialSupported,
      didMethod: SupportedDidMethodEnum.DID_JWK,
      keyType: 'Secp256k1',
    };
  }

  private getIssuanceCredentialFormat = async ({credentialSupported}: { credentialSupported: CredentialSupported }): Promise<string> => {
    for (const format of vcFormatPreferences) {
      if (format === credentialSupported.format) {
        const credentialFormat = credentialSupported.format;
        console.log(`Credential format ${format} supported by issuer, details: ${JSON.stringify(credentialFormat)}`);
        return           credentialFormat;
      } else {
        console.log(`Credential format ${format} not supported by issuer`);
      }
    }

    return Promise.reject(Error(`Credential formats '${credentialSupported.format}' not supported by wallet`));
  };

  private getIssuanceCryptoSuite = async ({credentialSupported}: { credentialSupported: CredentialSupported }): Promise<string> => {
    const suites_supported = credentialSupported.cryptographic_suites_supported ?? [];

    // TODO: Return array, so the wallet/user could choose
    switch (credentialSupported.format) {
      case 'jwt':
      case 'jwt_vc_json':
      case 'jwt_vc': {
        const supportedPreferences = jwtCryptographicSuitePreferences.filter((suite: SignatureAlgorithmEnum) => suites_supported.includes(suite));
        // if we cannot find supported cryptographic suites, we just try with the first preference
        return supportedPreferences.length > 0 ? supportedPreferences[0] : jwtCryptographicSuitePreferences[0];
      }
      case 'ldp':
      case 'jwt_vc_json_ld':
      case 'ldp_vc': {
        const supportedPreferences = jsonldCryptographicSuitePreferences.filter((suite: string) => suites_supported.includes(suite));
        // if we cannot find supported cryptographic suites, we just try with the first preference
        return supportedPreferences.length > 0 ? supportedPreferences[0] : jsonldCryptographicSuitePreferences[0];
      }
      default:
        return Promise.reject(Error(`Credential format '${credentialSupported.format}' not supported`));
    }
  };

  private getIssuanceDidMethod = async (format?: CredentialFormat | OID4VCICredentialFormat): Promise<SupportedDidMethodEnum> => {
    // TODO implementation. None of the implementers are currently returning supported did methods.
    if (format?.includes('jwt') && !format?.includes('jwt_vc_json_ld')) {
      return format ? didMethodPreferences[1] : didMethodPreferences[0];
    } else {
      return didMethodPreferences[0];
    }
  };
}

export default OpenId4VcIssuanceProvider;
