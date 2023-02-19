import { CredentialMapper, ICredential, OriginalVerifiableCredential } from '@sphereon/ssi-types'
import { UniqueVerifiableCredential, VerifiableCredential } from '@veramo/core'
import { Action } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

import { RootState, ToastTypeEnum } from '../../@types'
import {
  CREDENTIALS_LOADING,
  DELETE_CREDENTIAL_FAILED,
  DELETE_CREDENTIAL_SUCCESS,
  GET_CREDENTIALS_FAILED,
  GET_CREDENTIALS_SUCCESS,
  STORE_CREDENTIAL_FAILED,
  STORE_CREDENTIAL_SUCCESS
} from '../../@types/store/credential.action.types'
import { translate } from '../../localization/Localization'
import {
  deleteVerifiableCredential as deleteCredential,
  getVerifiableCredentialsFromStorage,
  storeVerifiableCredential as storeCredential
} from '../../services/credentialService'
import { showToast } from '../../utils/ToastUtils'
import { toCredentialSummary } from '../../utils/mappers/CredentialMapper'

export const getVerifiableCredentials = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: CREDENTIALS_LOADING })
    getVerifiableCredentialsFromStorage()
      .then((credentials: Array<UniqueVerifiableCredential>) => {
        const credentialSummaries = credentials.map((vc: UniqueVerifiableCredential) =>
          // TODO fix mismatch in types
          toCredentialSummary(vc.verifiableCredential as ICredential, vc.hash)
        )
        dispatch({ type: GET_CREDENTIALS_SUCCESS, payload: [...credentialSummaries] })
      })
      .catch(() => dispatch({ type: GET_CREDENTIALS_FAILED }))
  }
}

export const storeVerifiableCredential = (vc: VerifiableCredential): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: CREDENTIALS_LOADING })
    const mappedVc = CredentialMapper.toUniformCredential(vc as OriginalVerifiableCredential)
    storeCredential({ vc: mappedVc as VerifiableCredential })
      .then((hash: string) => {
        // TODO fix mismatch in types
        dispatch({ type: STORE_CREDENTIAL_SUCCESS, payload: toCredentialSummary(mappedVc as ICredential, hash) })
      })
      .catch(() => dispatch({ type: STORE_CREDENTIAL_FAILED }))
  }
}



export const deleteVerifiableCredential = (credentialHash: string): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({ type: CREDENTIALS_LOADING })
    deleteCredential({ hash: credentialHash })
      .then((isDeleted: boolean) => {
        if (isDeleted) {
          dispatch({ type: DELETE_CREDENTIAL_SUCCESS, payload: credentialHash })
          showToast(ToastTypeEnum.TOAST_SUCCESS, translate('credential_deleted_success_toast'))
        } else {
          dispatch({ type: DELETE_CREDENTIAL_FAILED })
          showToast(ToastTypeEnum.TOAST_ERROR, translate('credential_deleted_failed_toast'))
        }
      })
      .catch(() => {
        dispatch({ type: DELETE_CREDENTIAL_FAILED })
        showToast(ToastTypeEnum.TOAST_ERROR, translate('credential_deleted_failed_toast'))
      })
  }
}
