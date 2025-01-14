import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store'
import {CredentialMapper, OriginalVerifiableCredential} from '@sphereon/ssi-types'
import {generateDigest} from './CryptoUtils'
import {isUniqueDigitalCredential} from './CredentialUtils';
import {DcqlCredential, DcqlSdJwtVcCredential, DcqlW3cVcCredential} from 'dcql'


export function convertToDcqlCredentials(credential: UniqueDigitalCredential | OriginalVerifiableCredential): DcqlCredential {
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
    return {vct: payload.vct, claims: payload, credential_format: 'vc+sd-jwt'} satisfies DcqlSdJwtVcCredential // TODO dc+sd-jwt support?
  } else if ('docType' in payload! && 'namespaces' in payload) { // mdoc
    return {docType: payload.docType, namespaces: payload.namespaces, claims: payload}
  } else {
    return {
      claims: payload,
      credential_format: 'jwt_vc_json' // TODO jwt_vc_json-ld support
    } as DcqlW3cVcCredential
  }
}
