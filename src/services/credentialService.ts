import { VerifiableCredentialSP } from '@sphereon/ssi-sdk-core'
import { UniqueVerifiableCredential, VerifiableCredential } from '@veramo/core'

import {
  createVerifiableCredentialLDLocal,
  dataStoreDeleteVerifiableCredential,
  dataStoreGetVerifiableCredential,
  dataStoreORMGetVerifiableCredentials,
  dataStoreSaveVerifiableCredential
} from '../agent'
import {
  ICreateVerifiableCredentialArgs,
  IDeleteVerifiableCredentialArgs,
  IGetVerifiableCredentialArgs,
  IStoreVerifiableCredentialArgs
} from '../types'

export const getVerifiableCredentialsFromStorage = async (): Promise<Array<UniqueVerifiableCredential>> => {
  return dataStoreORMGetVerifiableCredentials()
}

export const storeVerifiableCredential = async (args: IStoreVerifiableCredentialArgs): Promise<string> => {
  return dataStoreSaveVerifiableCredential({ verifiableCredential: args.vc })
}

export const getVerifiableCredential = async (args: IGetVerifiableCredentialArgs): Promise<VerifiableCredential> => {
  return dataStoreGetVerifiableCredential({ hash: args.hash })
}

export const deleteVerifiableCredential = async (args: IDeleteVerifiableCredentialArgs): Promise<boolean> => {
  return dataStoreDeleteVerifiableCredential({ hash: args.hash })
}

export const createVerifiableCredential = async (
  args: ICreateVerifiableCredentialArgs
): Promise<VerifiableCredentialSP> => {
  return createVerifiableCredentialLDLocal(args)
}
