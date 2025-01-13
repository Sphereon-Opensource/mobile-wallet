import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store'
import {DcqlCredentialRepresentation, DcqlSdJwtVcRepresentation, DcqlW3cVcRepresentation} from 'dcql'
import {CredentialMapper, OriginalVerifiableCredential} from '@sphereon/ssi-types'
import {generateDigest} from './CryptoUtils'
import {isUniqueDigitalCredential} from './CredentialUtils';


export function convertToDcqlRepresentation(credential: UniqueDigitalCredential | OriginalVerifiableCredential): DcqlCredentialRepresentation {
  let payload
  if (isUniqueDigitalCredential(credential)) {
    if (!credential.originalVerifiableCredential) {
      throw new Error('originalVerifiableCredential is not defined in UniqueDigitalCredential')
    }
    payload = CredentialMapper.decodeVerifiableCredential(credential.originalVerifiableCredential, generateDigest)
  } else {
    payload = CredentialMapper.decodeVerifiableCredential(credential as OriginalVerifiableCredential, generateDigest)
  }

  if (!payload) {
    throw new Error('No payload found')
  }

  if ('decodedPayload' in payload && payload.decodedPayload) {
    payload = payload.decodedPayload
  }

  if ('vct' in payload!) {
    return {vct: payload.vct, claims: payload} satisfies DcqlSdJwtVcRepresentation
  } else if ('docType' in payload! && 'namespaces' in payload) {
    return {docType: payload.docType, namespaces: payload.namespaces, claims: payload}
  } else {
    return {
      claims: payload,
    } as DcqlW3cVcRepresentation
  }
}
