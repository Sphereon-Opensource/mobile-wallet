import {ICredentialBranding} from '@sphereon/ssi-sdk.data-store';
import {CredentialMapper, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {ICreateVerifiableCredentialArgs, UniqueVerifiableCredential, VerifiableCredential} from '@veramo/core';
import {Action} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';

import {ibGetCredentialBranding} from '../../agent';
import {translate} from '../../localization/Localization';
import {
  createVerifiableCredential as createCredential,
  deleteVerifiableCredential as deleteCredential,
  getVerifiableCredentialsFromStorage,
  storeVerifiableCredential as storeCredential,
} from '../../services/credentialService';
import {ICredentialSummary, RootState, ToastTypeEnum} from '../../types';
import {
  CREATE_CREDENTIAL_FAILED,
  CREATE_CREDENTIAL_SUCCESS,
  CREDENTIALS_LOADING,
  DELETE_CREDENTIAL_FAILED,
  DELETE_CREDENTIAL_SUCCESS,
  GET_CREDENTIALS_FAILED,
  GET_CREDENTIALS_SUCCESS,
  STORE_CREDENTIAL_FAILED,
  STORE_CREDENTIAL_SUCCESS,
} from '../../types/store/credential.action.types';
import {showToast} from '../../utils/ToastUtils';
import {toCredentialSummary} from '../../utils/mappers/credential/CredentialMapper';

export const getVerifiableCredentials = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: CREDENTIALS_LOADING});
    getVerifiableCredentialsFromStorage()
      .then(async (credentials: Array<UniqueVerifiableCredential>) => {
        const vcHashes: Array<{vcHash: string}> = credentials.map((uniqueCredential: UniqueVerifiableCredential): {vcHash: string} => ({
          vcHash: uniqueCredential.hash,
        }));
        const credentialsBranding: Array<ICredentialBranding> = await ibGetCredentialBranding({filter: vcHashes});
        const credentialSummaries: Array<ICredentialSummary> = await Promise.all(
          credentials.map(async (uniqueVC: UniqueVerifiableCredential): Promise<ICredentialSummary> => {
            const credentialBranding: ICredentialBranding | undefined = credentialsBranding.find(
              (branding: ICredentialBranding) => branding.vcHash === uniqueVC.hash,
            );
            return await toCredentialSummary(uniqueVC, credentialBranding?.localeBranding);
          }),
        );
        dispatch({type: GET_CREDENTIALS_SUCCESS, payload: [...credentialSummaries]});
      })
      .catch(() => dispatch({type: GET_CREDENTIALS_FAILED}));
  };
};

export const storeVerifiableCredential = (vc: VerifiableCredential): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: CREDENTIALS_LOADING});
    const mappedVc = CredentialMapper.toUniformCredential(vc as OriginalVerifiableCredential) as VerifiableCredential;
    storeCredential({vc: mappedVc})
      .then(async (hash: string) => {
        const credentialsBranding: Array<ICredentialBranding> = await ibGetCredentialBranding({filter: [{vcHash: hash}]});
        toCredentialSummary({verifiableCredential: mappedVc, hash}, credentialsBranding[0].localeBranding).then((summary: ICredentialSummary) =>
          dispatch({
            type: STORE_CREDENTIAL_SUCCESS,
            payload: summary,
          }),
        );
      })
      .catch(() => dispatch({type: STORE_CREDENTIAL_FAILED}));
  };
};

export const deleteVerifiableCredential = (credentialHash: string): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: CREDENTIALS_LOADING});
    deleteCredential({hash: credentialHash})
      .then((isDeleted: boolean) => {
        if (isDeleted) {
          dispatch({type: DELETE_CREDENTIAL_SUCCESS, payload: credentialHash});
          showToast(ToastTypeEnum.TOAST_SUCCESS, {
            message: translate('credential_deleted_success_toast'),
            showBadge: false,
          });
        } else {
          dispatch({type: DELETE_CREDENTIAL_FAILED});
          showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('credential_deleted_failed_toast')});
        }
      })
      .catch(() => {
        dispatch({type: DELETE_CREDENTIAL_FAILED});
        showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('credential_deleted_failed_toast')});
      });
  };
};

export const createVerifiableCredential = (args: ICreateVerifiableCredentialArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>) => {
    dispatch({type: CREDENTIALS_LOADING});
    createCredential(args)
      .then((vc: VerifiableCredential) => {
        storeCredential({vc}).then((hash: string) =>
          toCredentialSummary({verifiableCredential: vc, hash}).then((summary: ICredentialSummary) =>
            // TODO fix mismatch in types
            dispatch({
              type: CREATE_CREDENTIAL_SUCCESS,
              payload: summary,
            }),
          ),
        );
      })
      .catch((error: Error) => {
        console.log(error.message);
        dispatch({type: CREATE_CREDENTIAL_FAILED});
      });
  };
};
