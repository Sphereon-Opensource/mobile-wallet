import { UniqueVerifiableCredential } from '@veramo/core'

import { IStoreVerifiableCredentialArgs } from '../@types/services'
import { dataStoreORMGetVerifiableCredentials, dataStoreSaveVerifiableCredential } from '../agent'

// We want to extend this service with calls to the Veramo agent as the agent does all the work

export const getVerifiableCredentialsFromStorage = async (): Promise<Array<UniqueVerifiableCredential>> => {
  return dataStoreORMGetVerifiableCredentials()
}

export const storeVerifiableCredential = async (args: IStoreVerifiableCredentialArgs): Promise<string> => {
  return dataStoreSaveVerifiableCredential({ verifiableCredential: args.vc })
}
