import { ICredential, OriginalVerifiableCredential } from '@sphereon/ssi-types'
import { CredentialMapper } from '@sphereon/ssi-types/src/mapper/credential-mapper'
import { UniqueVerifiableCredential, VerifiableCredential } from '@veramo/core'
import { Dispatch } from 'react'
import { AnyAction } from 'redux'

import {
  getVerifiableCredentialsFromStorage,
  storeVerifiableCredential as storeCredential
} from '../../services/credentialService'
import { toCredentialSummary } from '../../utils/mappers/CredentialMapper'
import {
  CREDENTIALS_LOADING,
  GET_CREDENTIALS_FAILED,
  GET_CREDENTIALS_SUCCESS,
  STORE_CREDENTIAL_FAILED,
  STORE_CREDENTIAL_SUCCESS
} from '../types/credential.action.types'

export const getVerifiableCredentials = () => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: CREDENTIALS_LOADING })
    getVerifiableCredentialsFromStorage()
      .then((credential: Array<UniqueVerifiableCredential>) => {
        const credentialSummaries = credential.map((vc: UniqueVerifiableCredential) =>
          // TODO fix mismatch in types
          toCredentialSummary(vc.verifiableCredential as ICredential, vc.hash)
        )
        const payload = [...credentialSummaries]
        dispatch({ type: GET_CREDENTIALS_SUCCESS, payload })
      })
      .catch(() => dispatch({ type: GET_CREDENTIALS_FAILED }))
  }
}

export const storeVerifiableCredential = (vc: VerifiableCredential) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({ type: CREDENTIALS_LOADING })
    const mappedVc = CredentialMapper.toUniformCredential(vc as OriginalVerifiableCredential)
    storeCredential(mappedVc as VerifiableCredential)
      .then((hash: string) => {
        // TODO fix mismatch in types
        const payload = toCredentialSummary(mappedVc as ICredential, hash)
        dispatch({ type: STORE_CREDENTIAL_SUCCESS, payload })
      })
      .catch(() => dispatch({ type: STORE_CREDENTIAL_FAILED }))
  }
}
