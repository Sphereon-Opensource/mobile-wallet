import { OriginalVerifiableCredential } from '@sphereon/ssi-types'
import { CredentialMapper } from '@sphereon/ssi-types/src/mapper/credential-mapper'
import { UniqueVerifiableCredential, VerifiableCredential } from '@veramo/core'

import { dataStoreORMGetVerifiableCredentials, dataStoreSaveVerifiableCredential } from '../agent'

// We want to extend this service with calls to the Veramo agent as the agent does all the work

export const getVerifiableCredentialsFromStorage = async (): Promise<Array<UniqueVerifiableCredential>> => {
  return dataStoreORMGetVerifiableCredentials()
}

export const storeVerifiableCredential = async (vc: VerifiableCredential): Promise<string> => {
  return dataStoreSaveVerifiableCredential({ verifiableCredential: vc })
}
