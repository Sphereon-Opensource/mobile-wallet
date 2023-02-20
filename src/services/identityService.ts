import { DIDDocument, DIDDocumentSection, IAgentContext, IIdentifier, IKey, IResolver } from '@veramo/core'
import {
  _ExtendedIKey,
  _ExtendedVerificationMethod,
  _NormalizedVerificationMethod,
  extractPublicKeyHex,
  isDefined,
  mapIdentifierKeysToDoc,
  resolveDidOrThrow
} from '@veramo/utils'
import { VerificationMethod } from 'did-resolver'
import elliptic from 'elliptic'
import * as u8a from 'uint8arrays'

import { DID_PREFIX } from '../@config/constants'
import agent, { didManagerCreate, didManagerFind, didManagerGet } from '../agent'
import { ICreateOrGetIdentifierArgs, IdentifierAliasEnum, KeyManagementSystemEnum } from '../types'

export const getIdentifiers = async (): Promise<IIdentifier[]> => {
  // TODO fully implement
  return didManagerFind()
}

export const createIdentifier = async (): Promise<IIdentifier> => {
  // TODO fully implement
  return didManagerCreate()
}

export const getOrCreatePrimaryIdentifier = async (args?: ICreateOrGetIdentifierArgs): Promise<IIdentifier> => {
  const identifiers = (await didManagerFind(args?.method ? { provider: `${DID_PREFIX}:${args?.method}` } : {})).filter(
    (identifier) =>
      args?.createOpts?.options?.type === undefined ||
      identifier.keys.some((key: IKey) => key.type === args?.createOpts?.options?.type)
  )

  console.log(
    `Currently available identifiers for ${args?.method} / ${args?.createOpts?.options?.type}: ${identifiers.length}`
  )

  // Currently we only support one identifier
  const identifier =
    !identifiers || identifiers.length == 0
      ? await didManagerCreate({
          kms: args?.createOpts?.kms || KeyManagementSystemEnum.LOCAL,
          ...(args?.method && { provider: `${DID_PREFIX}:${args?.method}` }),
          alias:
            args?.createOpts?.alias ||
            `${IdentifierAliasEnum.PRIMARY}-${args?.method}-${args?.createOpts?.options?.type}`,
          options: args?.createOpts?.options
        })
      : identifiers[0]

  return didManagerGet({ did: identifier.did })
}

export const getFirstKeyWithRelation = async (
  identifier: IIdentifier,
  vmRelationship?: DIDDocumentSection,
  errorOnNotFound?: boolean
): Promise<_ExtendedIKey | undefined> => {
  const section = vmRelationship || 'verificationMethod' // search all VMs in case no relationship is provided
  const matchedKeys = await mapIdentifierKeysToDocWithJwkSupport(identifier, section, { agent })
  if (Array.isArray(matchedKeys) && matchedKeys.length > 0) {
    return matchedKeys[0]
  }
  if (errorOnNotFound === true) {
    throw new Error(`Could not find key with relationship ${section} in DID document for ${identifier.did}`)
  }
  return undefined
}

//TODO: Move to ssi-sdk/core and create PR upstream
/**
 * Dereferences keys from DID document and normalizes them for easy comparison.
 *
 * When dereferencing keyAgreement keys, only Ed25519 and X25519 curves are supported.
 * Other key types are omitted from the result and Ed25519 keys are converted to X25519
 *
 * @returns a Promise that resolves to the list of dereferenced keys.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export async function dereferenceDidKeysWithJwkSupport(
  didDocument: DIDDocument,
  section: DIDDocumentSection = 'keyAgreement',
  context: IAgentContext<IResolver>
): Promise<_NormalizedVerificationMethod[]> {
  const convert = section === 'keyAgreement'
  if (section === 'service') {
    return []
  }
  return (
    await Promise.all(
      (didDocument[section] || []).map(async (key: string | VerificationMethod) => {
        if (typeof key === 'string') {
          try {
            return (await context.agent.getDIDComponentById({
              didDocument,
              didUrl: key,
              section
            })) as _ExtendedVerificationMethod
          } catch (e) {
            return null
          }
        } else {
          return key as _ExtendedVerificationMethod
        }
      })
    )
  )
    .filter(isDefined)
    .map((key) => {
      const hexKey = extractPublicKeyHexWithJwkSupport(key, convert)
      const { publicKeyHex, publicKeyBase58, publicKeyBase64, publicKeyJwk, ...keyProps } = key
      const newKey = { ...keyProps, publicKeyHex: hexKey }
      if (convert && 'Ed25519VerificationKey2018' === newKey.type) {
        newKey.type = 'X25519KeyAgreementKey2019'
      }
      return newKey
    })
}

/**
 * Converts the publicKey of a VerificationMethod to hex encoding (publicKeyHex)
 *
 * @param pk - the VerificationMethod to be converted
 * @param convert - when this flag is set to true, Ed25519 keys are converted to their X25519 pairs
 * @returns the hex encoding of the public key
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function extractPublicKeyHexWithJwkSupport(pk: _ExtendedVerificationMethod, convert = false): string {
  if (pk.publicKeyJwk && pk.publicKeyJwk.kty === 'EC') {
    const secp256 = new elliptic.ec(pk.publicKeyJwk.crv === 'secp256k1' ? 'secp256k1' : 'p256')
    const prefix = pk.publicKeyJwk.crv === 'secp256k1' ? '04' : '03'
    const x = u8a.fromString(pk.publicKeyJwk.x!, 'base64url')
    const y = u8a.fromString(pk.publicKeyJwk.y!, 'base64url')
    const hex = `${prefix}${u8a.toString(x, 'base16')}${u8a.toString(y, 'base16')}`
    // We return directly as we don't want to convert the result back into Uint8Array and then convert again to hex as the elliptic lib already returns hex strings
    return secp256.keyFromPublic(hex, 'hex').getPublic(true, 'hex')
  } else if (pk.publicKeyJwk && pk.publicKeyJwk.crv === 'Ed25519') {
    return u8a.toString(u8a.fromString(pk.publicKeyJwk.x!, 'base64url'), 'base16')
  } else {
    // delegate the other types to the original Veramo function
    return extractPublicKeyHex(pk, convert)
  }
}

/**
 * Maps the keys of a locally managed {@link @veramo/core#IIdentifier | IIdentifier} to the corresponding
 * {@link did-resolver#VerificationMethod | VerificationMethod} entries from the DID document.
 *
 * @param identifier - the identifier to be mapped
 * @param section - the section of the DID document to be mapped (see
 *   {@link https://www.w3.org/TR/did-core/#verification-relationships | verification relationships}), but can also be
 *   `verificationMethod` to map all the keys.
 * @param context - the veramo agent context, which must contain a {@link @veramo/core#IResolver | IResolver}
 *   implementation that can resolve the DID document of the identifier.
 *
 * @returns an array of mapped keys. The corresponding verification method is added to the `meta.verificationMethod`
 *   property of the key.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export async function mapIdentifierKeysToDocWithJwkSupport(
  identifier: IIdentifier,
  section: DIDDocumentSection = 'keyAgreement',
  context: IAgentContext<IResolver>
): Promise<_ExtendedIKey[]> {
  const keys = await mapIdentifierKeysToDoc(identifier, section, context)
  const didDocument = await resolveDidOrThrow(identifier.did, context)
  // dereference all key agreement keys from DID document and normalize
  const documentKeys: VerificationMethod[] = await dereferenceDidKeysWithJwkSupport(didDocument, section, context)

  const localKeys = identifier.keys.filter(isDefined)
  // finally map the didDocument keys to the identifier keys by comparing `publicKeyHex`
  const extendedKeys: _ExtendedIKey[] = documentKeys
    .map((verificationMethod) => {
      if (verificationMethod.type !== 'JsonWebKey2020') {
        return null
      }
      const localKey = localKeys.find((localKey) => localKey.publicKeyHex === verificationMethod.publicKeyHex)
      if (localKey) {
        const { meta, ...localProps } = localKey
        return { ...localProps, meta: { ...meta, verificationMethod } }
      } else {
        return null
      }
    })
    .filter(isDefined)

  return keys.concat(extendedKeys)
}
