import { ICreateVerifiableCredentialArgs, UniqueVerifiableCredential, VerifiableCredential } from '@veramo/core'

import {
  dataStoreDeleteVerifiableCredential,
  dataStoreGetVerifiableCredential,
  dataStoreORMGetVerifiableCredentials,
  dataStoreSaveVerifiableCredential,
  createVerifiableCredential as issueVerifiableCredential
} from '../agent'
import { IDeleteVerifiableCredentialArgs, IGetVerifiableCredentialArgs, IStoreVerifiableCredentialArgs } from '../types'

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
): Promise<VerifiableCredential> => {
  return issueVerifiableCredential(args)
}
