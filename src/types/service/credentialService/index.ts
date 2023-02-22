import ProofPurpose from '@sphereon/ssi-sdk-vc-handler-ld-local'
import { CredentialPayload, VerifiableCredential } from '@veramo/core'

export interface IStoreVerifiableCredentialArgs {
  vc: VerifiableCredential
}

export interface IGetVerifiableCredentialArgs {
  hash: string
}

export interface IDeleteVerifiableCredentialArgs {
  hash: string
}

export interface ICreateVerifiableCredentialArgs {
  credential: CredentialPayload
  keyRef?: string
  purpose?: typeof ProofPurpose
}
