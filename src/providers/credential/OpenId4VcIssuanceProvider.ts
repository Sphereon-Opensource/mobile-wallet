import {
  AccessTokenClient,
  AccessTokenResponse,
  Alg,
  CredentialRequestClientBuilder,
  CredentialResponse,
  EndpointMetadata,
  IssuanceInitiation,
  IssuanceInitiationWithBaseUrl,
  JWTSignerArgs,
  MetadataClient,
  ProofOfPossessionOpts
} from '@sphereon/oid4vci-client'
import { CredentialMetadata } from '@sphereon/oid4vci-client/dist/main/lib/types/OID4VCIServerMetadata'
import { KeyUse } from '@sphereon/ssi-sdk-jwk-did-provider'
import { CredentialFormat } from '@sphereon/ssi-types'
import { DIDResolutionResult, IIdentifier } from '@veramo/core'
import Debug from 'debug'

import { APP_ID } from '../../@config/constants'
import {
  ICredentialFormatOpts,
  IGetAccessTokenArgs,
  IGetCredentialArgs,
  IGetCredentialFromIssuanceArgs,
  IGetIssuanceCryptoSuiteArgs,
  IGetIssuanceInitiationFromUriArgs,
  IGetIssuanceOptsArgs,
  IGetMetaDataArgs,
  IGetVcIssuanceFormatArgs,
  IIssuanceOpts,
  QrTypesEnum,
  SignatureAlgorithmEnum,
  SupportedDidMethodEnum
} from '../../@types'
import { didResolver } from '../../agent'
import { getOrCreatePrimaryIdentifier } from '../../services/identityService'
import { signJWT } from '../../services/signatureService'
import { KeyTypeFromCryptographicSuite, SignatureAlgorithmFromKey } from '../../utils/KeyUtils'

const { v4: uuidv4 } = require('uuid')

const debug = Debug(`${APP_ID}:openid`)

// TODO these preferences need to come from the user
export const vcFormatPreferences = ['jwt_vc', 'ldp_vc']

export const didMethodPreferences = [SupportedDidMethodEnum.DID_JWK, SupportedDidMethodEnum.DID_KEY]

export const jsonldCryptographicSuitePreferences = [
  'Ed25519Signature2018',
  'EcdsaSecp256k1Signature2019',
  'Ed25519Signature2020',
  'JsonWebSignature2020',
  'JcsEd25519Signature2020'
]

export const jwtCryptographicSuitePreferences = [
  SignatureAlgorithmEnum.ES256K,
  SignatureAlgorithmEnum.ES256,
  SignatureAlgorithmEnum.EdDSA
]

class OpenId4VcIssuanceProvider {
  public getIssuanceInitiationFromUri = async (
    args: IGetIssuanceInitiationFromUriArgs
  ): Promise<IssuanceInitiationWithBaseUrl> => {
    if (!args.uri.startsWith(QrTypesEnum.OPENID_INITIATE_ISSUANCE)) {
      debug(`Invalid Uri. Uri: ${args.uri}`)
      return Promise.reject(Error('Invalid Uri'))
    }
    console.log(args.uri)

    const issuanceInitiation: IssuanceInitiationWithBaseUrl = IssuanceInitiation.fromURI(args.uri)
    debug(`IssuanceInitiation: ${JSON.stringify(issuanceInitiation)}`)

    return issuanceInitiation
  }

  public getMetadata = async (args: IGetMetaDataArgs): Promise<EndpointMetadata> => {
    const metadata = await MetadataClient.retrieveAllMetadataFromInitiation(args.issuanceInitiation)
    debug(`Metadata:\r\n${JSON.stringify(metadata)}`)

    return metadata
  }

  public getAccessToken = async (args: IGetAccessTokenArgs): Promise<AccessTokenResponse> => {
    return new AccessTokenClient()
      .acquireAccessTokenUsingIssuanceInitiation(args.issuanceInitiation, {
        asOpts: {
          clientId: this.determineClientId(args.metadata?.token_endpoint)
        },
        ...(args.pin && { pin: args.pin }),
        ...(args.metadata && { metadata: args.metadata })
      })
      .then((response: any) => {
        // TODO fix any (but the lib has a weird structure for returns)
        if (response.error) {
          debug(`Unable to get token: ${response.error}`)

          return Promise.reject(response.error)
        }
        debug(`Token response: ${JSON.stringify(response)}`)

        return response as AccessTokenResponse
      })
      .catch((error: Error) => {
        debug(`Unable to get token: ${error}`)

        return Promise.reject(error.message)
      })
  }

  public getCredential = async (args: IGetCredentialArgs): Promise<CredentialResponse> => {
    // TODO currently we assume an identifier only has one key
    const id = args.jwtOpts.identifier
    console.log(`===ID: ${JSON.stringify(id, null, 2)}`)
    console.log(`###ID: did: ${id.did}`)
    id.keys.forEach((key) => console.log(`##KEY: kid:${key.kid}, type:${key.type}, meta: ${JSON.stringify(key.meta)}`))
    const alg = SignatureAlgorithmFromKey(args.jwtOpts.identifier.keys[0])
    console.log(`###ALG: ${alg}`)

    const credentialRequestClient = CredentialRequestClientBuilder.fromIssuanceInitiation(
      args.issuanceInitiation,
      args.metadata
    )
      .withToken(args.token)
      .build()

    const didResult = await didResolver.resolve(id.did, { accept: 'application/did+ld+json' })
    const fragment = this.determineKidFragment(id, didResult)

    /* if (args.metadata?.token_endpoint.includes('identiproof')) {
      //FIXME: Remove as this is a hack to support Crossword's issuer, since they expect a DID instead of a did-url
      fragment = ''
    }*/

    const kid = `${args.jwtOpts.identifier.did}${fragment}`
    console.log(`kid for PoP JWT: ${kid}`)
    const proofOpts: ProofOfPossessionOpts = {
      jwtSignerArgs: {
        header: {
          kid,
          alg: alg as Alg
        },
        payload: {
          jti: uuidv4(),
          iss: this.determineClientId(args.metadata?.token_endpoint),
          aud: args.metadata?.issuer,
          ...(args.jwtOpts.nonce && { nonce: args.jwtOpts.nonce })
        }
      },
      jwtSignerCallback: (signArgs: JWTSignerArgs) =>
        signJWT({
          identifier: args.jwtOpts.identifier,
          header: { ...signArgs.header, typ: 'JWT' },
          payload: signArgs.payload,
          options: { issuer: signArgs.payload.iss!, expiresIn: signArgs.payload.exp, canonicalize: false }
        })
    }

    return (
      credentialRequestClient
        .acquireCredentialsUsingProof(proofOpts, { format: args.format })
        // TODO fix any response (but the lib has a weird structure for returns)
        .then((response: any) => {
          if (response.error) {
            debug(`Unable to get credential: ${response.error}`)
            return Promise.reject(response.error)
          }
          debug(`Credential response: ${JSON.stringify(response)}`)

          return response as CredentialResponse
        })
        .catch((error: Error) => {
          debug(`Unable to get credential: ${error}`)
          return Promise.reject(error)
        })
    )
  }

  private determineClientId(endpoint?: string) {
    //FIXME: Remove. Needs to move to party/connection management. Crossword expects a certain clientID
    return endpoint !== undefined && endpoint.includes('identiproof') ? 'default-pre-auth-client' : APP_ID
  }

  private determineKidFragment(id: IIdentifier, didResult: DIDResolutionResult) {
    // TODO: add optional kid value argument
    console.log(JSON.stringify(didResult, null, 2))
    let fragment: string = id.keys[0].kid
    if (id.provider.endsWith(SupportedDidMethodEnum.DID_JWK)) {
      fragment = '#0'
    } else if (id.provider.endsWith(SupportedDidMethodEnum.DID_KEY)) {
      fragment = didResult.didDocument?.authentication![0] as string
    } else if (didResult.didDocument?.authentication && Array.isArray(didResult.didDocument?.authentication)) {
      if (typeof didResult.didDocument?.authentication[0] === 'string') {
        fragment = didResult.didDocument.authentication[0]
      } else {
        fragment = didResult.didDocument.authentication[0].id
      }
    } else if (didResult.didDocument?.verificationMethod && Array.isArray(didResult.didDocument.verificationMethod)) {
      if (typeof didResult.didDocument?.verificationMethod[0] === 'string') {
        fragment = didResult.didDocument.verificationMethod[0]
      } else {
        fragment = didResult.didDocument.verificationMethod[0].id
      }
    }
    if (!fragment.startsWith(`#`)) {
      if (fragment.includes('#')) {
        fragment = `#${fragment.split('#')[1]}`
      } else {
        fragment = `#${fragment}`
      }
    }
    return fragment
  }

  public getCredentialFromIssuance = async (args: IGetCredentialFromIssuanceArgs): Promise<CredentialResponse> => {
    return this.getMetadata({ issuanceInitiation: args.issuanceInitiation }).then((metadata: EndpointMetadata) => {
      console.log(JSON.stringify(metadata, null, 2))
      return (
        this.getIssuanceOpts({
          // only supporting one credential type for now
          // TODO Added for JFF demo. Needs to come from args.issuanceInitiation.issuanceInitiationRequest.credential_type
          credentialType: 'openbadge',
          metadata
        })
          // TODO replace getOrCreatePrimaryIdentifier() when we have proper identities in place
          .then((issuanceOpts: IIssuanceOpts) => {
            console.log('ISSUANCE OPTS:')
            console.log(JSON.stringify(issuanceOpts))
            return getOrCreatePrimaryIdentifier({
              method: issuanceOpts.didMethod,
              createOpts: { options: { type: issuanceOpts.keyType, use: KeyUse.Signature } }
            }).then((identifier: IIdentifier) =>
              this.getAccessToken({
                issuanceInitiation: args.issuanceInitiation,
                metadata,
                ...(args.pin && { pin: args.pin })
              }).then((tokenResponse: AccessTokenResponse) => {
                console.log(`Access token: ${tokenResponse.access_token}`)
                return this.getCredential({
                  issuanceInitiation: args.issuanceInitiation,
                  token: tokenResponse.access_token,
                  format: issuanceOpts.format,
                  jwtOpts: {
                    identifier,
                    nonce: tokenResponse.c_nonce
                  },
                  metadata
                })
              })
            )
          })
      )
    })
  }

  private getIssuanceOpts = async (args: IGetIssuanceOptsArgs): Promise<IIssuanceOpts> => {
    if (!args.metadata.oid4vci_metadata) {
      console.log('WARNING: Reverting to default for key/signature suites, as no Server Metadata was present!')
      return await this.defaultIssuanceOpts(args)
    }

    const credentials_supported = args.metadata.oid4vci_metadata.credentials_supported
    const credentialMetadata: CredentialMetadata =
      credentials_supported[
        Object.keys(credentials_supported).find((key) => key.toLowerCase().includes(args.credentialType.toLowerCase()))!
      ]

    if (!credentialMetadata) {
      return Promise.reject(Error(`Credential type '${args.credentialType}' is not supported`))
    }

    const credentialFormatOpts: ICredentialFormatOpts = await this.getIssuanceCredentialFormat({ credentialMetadata })
    const didMethod: SupportedDidMethodEnum = await this.getIssuanceDidMethod(credentialFormatOpts.format)
    const cryptographicSuite: string = await this.getIssuanceCryptoSuite({ credentialFormatOpts })

    return {
      didMethod,
      format: credentialFormatOpts.format,
      keyType: KeyTypeFromCryptographicSuite(cryptographicSuite)
    }
  }

  private async defaultIssuanceOpts(args: IGetIssuanceOptsArgs): Promise<IIssuanceOpts> {
    // It is totally valid to have no oid4vci metadata. We are going to pick what suits us best
    // FIXME: Remove issuer specific demo code
    if (args.metadata.issuer.includes('did')) {
      // Velocity/Greenlight wants JWK with ES256K
      return {
        didMethod: SupportedDidMethodEnum.DID_JWK,
        keyType: 'Secp256k1',
        format: 'jwt_vc'
      }
    } else {
      return {
        didMethod: SupportedDidMethodEnum.DID_JWK,
        keyType: 'Secp256r1',
        format: 'jwt_vc'
      }
    }
  }

  private getIssuanceCredentialFormat = async (args: IGetVcIssuanceFormatArgs): Promise<ICredentialFormatOpts> => {
    for (const format of vcFormatPreferences) {
      if (format in args.credentialMetadata.formats) {
        return {
          credentialFormat: args.credentialMetadata.formats[format],
          format
        }
      }
    }

    return Promise.reject(Error(`Credential formats '${Object.keys(args.credentialMetadata.formats)}' not supported`))
  }

  private getIssuanceCryptoSuite = async (args: IGetIssuanceCryptoSuiteArgs): Promise<string> => {
    const suites_supported = args.credentialFormatOpts.credentialFormat.cryptographic_suites_supported || []

    switch (args.credentialFormatOpts.format) {
      case 'jwt_vc': {
        const supportedPreferences = jwtCryptographicSuitePreferences.filter((suite: SignatureAlgorithmEnum) =>
          suites_supported.includes(suite)
        )
        // if we cannot find supported cryptographic suites, we just try with the first preference
        return supportedPreferences.length > 0 ? supportedPreferences[0] : jwtCryptographicSuitePreferences[0]
      }
      case 'ldp_vc': {
        const supportedPreferences = jsonldCryptographicSuitePreferences.filter((suite: string) =>
          suites_supported.includes(suite)
        )
        // if we cannot find supported cryptographic suites, we just try with the first preference
        return supportedPreferences.length > 0 ? supportedPreferences[0] : jsonldCryptographicSuitePreferences[0]
      }
      default:
        throw new Error(`Credential format '${args.credentialFormatOpts.format}' not supported`)
    }
  }

  private getIssuanceDidMethod = async (format?: CredentialFormat): Promise<SupportedDidMethodEnum> => {
    // TODO implementation. None of the implementers are currently returning supported did methods.
    return format
      ? format.includes('jwt')
        ? didMethodPreferences[0]
        : didMethodPreferences[1]
      : didMethodPreferences[0]
  }
}

export default OpenId4VcIssuanceProvider
