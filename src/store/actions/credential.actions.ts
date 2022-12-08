import { ICredential, OriginalVerifiableCredential } from '@sphereon/ssi-types'
import { CredentialMapper } from '@sphereon/ssi-types/src/mapper/credential-mapper'
import { UniqueVerifiableCredential, VerifiableCredential } from '@veramo/core'
import { Dispatch } from 'react'
import { AnyAction } from 'redux'

import {
  CREDENTIALS_LOADING,
  GET_CREDENTIALS_FAILED,
  GET_CREDENTIALS_SUCCESS,
  STORE_CREDENTIAL_FAILED,
  STORE_CREDENTIAL_SUCCESS
} from '../../@types/store/credential.action.types'
import {
  getVerifiableCredentialsFromStorage,
  storeVerifiableCredential as storeCredential
} from '../../services/credentialService'
import { toCredentialSummary } from '../../utils/mappers/CredentialMapper'

export const getVerifiableCredentials = (): ((dispatch: Dispatch<AnyAction>) => void) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: CREDENTIALS_LOADING })
    getVerifiableCredentialsFromStorage()
      .then((credentials: Array<UniqueVerifiableCredential>) => {
        const credentialSummaries = credentials.map((vc: UniqueVerifiableCredential) =>
          // TODO fix mismatch in types
          toCredentialSummary(vc.verifiableCredential as ICredential, vc.hash)
        )
        const payload = [...credentialSummaries]
        dispatch({ type: GET_CREDENTIALS_SUCCESS, payload })
      })
      .catch(() => dispatch({ type: GET_CREDENTIALS_FAILED }))
  }
}

export const storeVerifiableCredential = (vc: VerifiableCredential): ((dispatch: Dispatch<AnyAction>) => void) => { // TODO args
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: CREDENTIALS_LOADING })
    const mappedVc = CredentialMapper.toUniformCredential(vc as OriginalVerifiableCredential)
    storeCredential({ vc: mappedVc as VerifiableCredential })
      .then((hash: string) => {
        // TODO fix mismatch in types
        const payload = toCredentialSummary(mappedVc as ICredential, hash)
        dispatch({ type: STORE_CREDENTIAL_SUCCESS, payload })
      })
      .catch(() => dispatch({ type: STORE_CREDENTIAL_FAILED }))
  }
}
