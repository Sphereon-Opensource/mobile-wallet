import {
  AccessTokenResponse,
  AuthzFlowType,
  CredentialResponse,
  EndpointMetadata,
  Jwt,
  OpenID4VCIClient,
  ProofOfPossessionCallbacks
} from "@sphereon/openid4vci-client";
import { KeyUse } from "@sphereon/ssi-sdk-jwk-did-provider";
import { CredentialFormat } from "@sphereon/ssi-types";
import { _ExtendedIKey } from "@veramo/utils";
import Debug from "debug";

import { APP_ID } from "../../@config/constants";
import { translate } from "../../localization/Localization";
import { getOrCreatePrimaryIdentifier } from "../../services/identityService";
import { signJWT } from "../../services/signatureService";
import {
  ICredentialFormatOpts,
  ICredentialMetadata,
  IErrorDetails,
  IGetCredentialArgs,
  IGetCredentialsArgs,
  IGetIssuanceCryptoSuiteArgs,
  IGetIssuanceInitiationFromUriArgs,
  IGetVcIssuanceFormatArgs,
  IIssuanceOpts,
  IServerMetadataAndCryptoMatchingResponse,
  Oidc4vciErrorEnum,
  QrTypesEnum,
  SignatureAlgorithmEnum,
  SupportedDidMethodEnum
} from "../../types";
import { KeyTypeFromCryptographicSuite, SignatureAlgorithmFromKey } from "../../utils/KeyUtils";
import { getFirstKeyWithRelation } from "@sphereon/ssi-sdk-did-utils";
import { context } from "../../agent";

const { v4: uuidv4 } = require("uuid");

const debug = Debug(`${APP_ID}:openid4vci`);

// TODO these preferences need to come from the user
export const vcFormatPreferences = ["jwt_vc", "ldp_vc"];

export type JsonLdSignatureSuite =
  "Ed25519Signature2018" |
  "EcdsaSecp256k1Signature2019" |
  "Ed25519Signature2020" |
  "JsonWebSignature2020" |
  "JcsEd25519Signature2020" |
  "ES256k"

export type KeyType =
  | "EcdsaSecp256k1VerificationKey2019"


export interface DIDSupport {
  method: SupportedDidMethodEnum
  keyTypes: KeyType[]
  signatureSuites: JsonLdSignatureSuite[]
}

export const didMethodPreferences = [SupportedDidMethodEnum.DID_KEY, SupportedDidMethodEnum.DID_JWK];

export const jsonldCryptographicSuitePreferences = [
  "Ed25519Signature2018",
  "EcdsaSecp256k1Signature2019",
  "Ed25519Signature2020",
  "JsonWebSignature2020",
  "JcsEd25519Signature2020"
];

const didPref = {

  "Ed25519Signature2018": { didMethods: [SupportedDidMethodEnum.DID_KEY] },
  "EcdsaSecp256k1Signature2019": { didMethods: [SupportedDidMethodEnum.DID_JWK, SupportedDidMethodEnum.DID_ION, SupportedDidMethodEnum.DID_ETHR] },
  "Ed25519Signature2020": { didMethods: [SupportedDidMethodEnum.DID_KEY] },
  "JsonWebSignature2020": { didMethods: [SupportedDidMethodEnum.DID_JWK] }

};

export const jwtCryptographicSuitePreferences = [SignatureAlgorithmEnum.ES256K, SignatureAlgorithmEnum.ES256, SignatureAlgorithmEnum.EdDSA];

class OpenId4VcIssuanceProvider {
  public static getErrorDetails = (error: Oidc4vciErrorEnum): IErrorDetails => {
    // We want to move this over to some general error handling within the app
    const genericError = {
      title: translate("error_generic_title"),
      message: translate("error_generic_message"),
      detailsMessage: `<b>${translate("error_details_generic_message")}</b>`
    };

    switch (error) {
      case Oidc4vciErrorEnum.INVALID_REQUEST:
        return {
          ...genericError,
          detailsTitle: translate("oidc4vci_error_invalid_request")
        };
      case Oidc4vciErrorEnum.INVALID_CLIENT:
        return {
          ...genericError,
          detailsTitle: translate("oidc4vci_error_invalid_client")
        };
      case Oidc4vciErrorEnum.INVALID_GRANT:
        return {
          ...genericError,
          detailsTitle: translate("oidc4vci_error_invalid_grant")
        };
      case Oidc4vciErrorEnum.UNAUTHORIZED_CLIENT:
        return {
          ...genericError,
          detailsTitle: translate("oidc4vci_error_unauthorized_client")
        };
      case Oidc4vciErrorEnum.UNSUPPORTED_GRANT_TYPE:
        return {
          ...genericError,
          detailsTitle: translate("oidc4vci_error_unsupported_grant_type")
        };
      case Oidc4vciErrorEnum.INVALID_SCOPE:
        return {
          ...genericError,
          detailsTitle: translate("oidc4vci_error_unsupported_invalid_scope")
        };
      case Oidc4vciErrorEnum.INVALID_OR_MISSING_PROOF:
        return {
          ...genericError,
          detailsTitle: translate("oidc4vci_error_invalid_or_missing_proof")
        };
      default:
        return {
          ...genericError,
          detailsTitle: translate("error_details_generic_title")
        };
    }
  };
  private readonly client: OpenID4VCIClient;
  private serverMetadata: EndpointMetadata | undefined;
  private credentialsSupported: Array<ICredentialMetadata> | undefined;
  private issuanceOpts: Record<string, IIssuanceOpts> | undefined;
  private accessTokenResponse: AccessTokenResponse | undefined;

  private constructor(client: OpenID4VCIClient) {
    this.client = client;
  }

  public static initiationFromUri = async ({ uri }: IGetIssuanceInitiationFromUriArgs): Promise<OpenId4VcIssuanceProvider> => {
    if (!uri || !uri.startsWith(QrTypesEnum.OPENID_INITIATE_ISSUANCE)) {
      debug(`Invalid Uri: ${uri}`);
      return Promise.reject(Error("Invalid Uri"));
    }
    return new OpenId4VcIssuanceProvider(
      await OpenID4VCIClient.initiateFromURI({
        issuanceInitiationURI: uri,
        flowType: AuthzFlowType.PRE_AUTHORIZED_CODE_FLOW
      })
    );
  };

  public getCredentialsFromIssuance = async ({ pin }: IGetCredentialsArgs): Promise<Record<string, CredentialResponse>> => {
    await this.getServerMetadataAndPerformCryptoMatching();
    const credentialResponses: Record<string, CredentialResponse> = {};
    const initTypes = this.client.getCredentialTypesFromInitiation();
    for (const credentialType of Object.keys(await this.getIssuanceOpts())) {
      if (!initTypes.includes(credentialType)) {
        continue;
      }
      credentialResponses[credentialType] = await this.getCredential({
        credentialType,
        pin
      });
    }
    if (Object.keys(credentialResponses).length === 0) {
      return Promise.reject(Error("Could not get credentials from issuance and match them on supported types."));
    }

    return credentialResponses;
  };

  public getCredential = async ({ credentialType, pin }: IGetCredentialArgs): Promise<CredentialResponse> => {
    const { issuanceOpts } = await this.getServerMetadataAndPerformCryptoMatching();

    const credIssuanceOpt = issuanceOpts[credentialType];
    if (!credIssuanceOpt) {
      return Promise.reject(Error(`Cannot get credential issuance options for credential type ${credentialType}`));
    }
    const identifier = await getOrCreatePrimaryIdentifier({
      method: credIssuanceOpt.didMethod,
      createOpts: { options: { type: credIssuanceOpt.keyType, use: KeyUse.Signature } }
    });
    const key =
      (await getFirstKeyWithRelation(identifier, context, "authentication", false)) ||
      ((await getFirstKeyWithRelation(identifier, context, "verificationMethod", true)) as _ExtendedIKey);
    const kid = key.meta.verificationMethod.id;
    const alg = SignatureAlgorithmFromKey(key);

    const callbacks: ProofOfPossessionCallbacks = {
      signCallback: (jwt: Jwt, kid: string) => {
        console.log(`header: ${JSON.stringify({ ...jwt.header, typ: "JWT", kid })}`);
        console.log(`payload: ${JSON.stringify({ ...jwt.payload })}`);
        return signJWT({
          identifier,
          header: { ...jwt.header, typ: "JWT", kid },
          payload: { ...jwt.payload },
          // TODO fix non null assertion
          options: { issuer: jwt.payload!.iss!, expiresIn: jwt.payload!.exp, canonicalize: false }
        });
      }
    };

    try {
      // We need to make sure we have acquired the access token
      await this.acquireAccessToken({ pin });

      console.log(`cred type: ${credentialType}, format: ${credIssuanceOpt.format}, kid: ${kid}, alg: ${alg}`);
      return this.client.acquireCredentials({
        credentialType,
        proofCallbacks: callbacks,
        format: credIssuanceOpt.format,
        kid,
        alg,
        jti: uuidv4()
      });
    } catch (error) {
      console.log(`Unable to get credential: ${error}`);
      return Promise.reject(error);
    }
  };

  private static determineClientId(issuer?: string) {
    //FIXME: Remove. Needs to move to party/connection management. Crossword expects a certain clientID
    return issuer !== undefined && issuer.includes("identiproof") ? "default-pre-auth-client" : APP_ID;
  }

  public getServerMetadataAndPerformCryptoMatching = async (): Promise<IServerMetadataAndCryptoMatchingResponse> => {
    if (!this.serverMetadata) {
      this.serverMetadata = await this.client.retrieveServerMetadata();
    }
    if (!this.credentialsSupported) {
      const credentialsSupported = [];
      for (const [credentialType, credentialMetadata] of Object.entries(await this.client.getCredentialsSupported(true))) {
        credentialsSupported.push({ credentialType, ...credentialMetadata });
      }
      this.credentialsSupported = credentialsSupported;
    }
    return {
      serverMetadata: this.serverMetadata,
      credentialsSupported: this.credentialsSupported,
      issuanceOpts: await this.getIssuanceOpts()
    };
  };

  public acquireAccessToken = async ({ pin }: { pin?: string }): Promise<AccessTokenResponse> => {
    if (!this.accessTokenResponse) {
      const clientId = OpenId4VcIssuanceProvider.determineClientId(this.serverMetadata?.issuer);
      this.accessTokenResponse = await this.client.acquireAccessToken({ pin, clientId });
    }
    return this.accessTokenResponse;
  };

  private getIssuanceOpts = async (): Promise<Record<string, IIssuanceOpts>> => {
    if (this.issuanceOpts) {
      return this.issuanceOpts;
    }
    const issuanceOpts: Record<string, IIssuanceOpts> = {};
    if (!this.credentialsSupported) {
      return Promise.reject(Error("No credentials supported"));
    }

    for (const credentialMetadata of this.credentialsSupported) {
      if (!this.serverMetadata?.openid4vci_metadata || !credentialMetadata) {
        issuanceOpts[credentialMetadata.credentialType] = this.defaultIssuanceOpts(credentialMetadata.credentialType);
        continue;
      }

      const credentialFormatOpts: ICredentialFormatOpts = await this.getIssuanceCredentialFormat({ credentialMetadata });
      const cryptographicSuite: string = await this.getIssuanceCryptoSuite({ credentialFormatOpts });
      const didMethod: SupportedDidMethodEnum = await this.getIssuanceDidMethod(credentialFormatOpts.format);

      issuanceOpts[credentialMetadata.credentialType] = {
        didMethod,
        format: credentialFormatOpts.format,
        keyType: KeyTypeFromCryptographicSuite(cryptographicSuite)
      };
    }

    this.issuanceOpts = issuanceOpts;
    console.log(JSON.stringify(issuanceOpts));
    return this.issuanceOpts;
  };

  private defaultIssuanceOpts(credentialType: string): IIssuanceOpts {
    console.log(
      `WARNING: Reverting to default for key/signature suites for credential type '${credentialType}', as no Server Metadata or not metadata match was present!`
    );
    return {
      didMethod: SupportedDidMethodEnum.DID_KEY,
      keyType: "Ed25519",
      format: "jwt_vc"
    };
  }

  private getIssuanceCredentialFormat = async ({ credentialMetadata }: IGetVcIssuanceFormatArgs): Promise<ICredentialFormatOpts> => {
    for (const format of vcFormatPreferences) {
      if (format in credentialMetadata.formats) {
        const credentialFormat = credentialMetadata.formats[format];
        console.log(`Credential format ${format} supported by issuer, details: ${JSON.stringify(credentialFormat)}`);
        return {
          credentialFormat,
          format
        };
      } else {
        console.log(`Credential format ${format} not supported by issuer`);
      }
    }

    return Promise.reject(Error(`Credential formats '${Object.keys(credentialMetadata.formats)}' not supported by wallet`));
  };

  private getIssuanceCryptoSuite = async ({ credentialFormatOpts }: IGetIssuanceCryptoSuiteArgs): Promise<string> => {
    const suites_supported = credentialFormatOpts.credentialFormat.cryptographic_suites_supported || [];

    console.log(suites_supported);
    switch (credentialFormatOpts.format) {
      case "jwt":
      case "jwt_vc": {
        const supportedPreferences = jwtCryptographicSuitePreferences.filter((suite: SignatureAlgorithmEnum) => suites_supported.includes(suite));
        // if we cannot find supported cryptographic suites, we just try with the first preference
        return supportedPreferences.length > 0 ? supportedPreferences[0] : jwtCryptographicSuitePreferences[0];
      }
      case "ldp":
      case "ldp_vc": {
        const supportedPreferences = jsonldCryptographicSuitePreferences.filter((suite: string) => suites_supported.includes(suite));
        // if we cannot find supported cryptographic suites, we just try with the first preference
        return supportedPreferences.length > 0 ? supportedPreferences[0] : jsonldCryptographicSuitePreferences[0];
      }
      default:
        return Promise.reject(Error(`Credential format '${credentialFormatOpts.format}' not supported`));
    }
  };

  private getIssuanceDidMethod = async (format?: CredentialFormat): Promise<SupportedDidMethodEnum> => {
    // TODO implementation. None of the implementers are currently returning supported did methods.
    return format ? (format.includes("jwt") ? didMethodPreferences[1] : didMethodPreferences[0]) : didMethodPreferences[0];
  };
}

export default OpenId4VcIssuanceProvider;
