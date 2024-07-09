import {ICredentialBranding, Party} from '@sphereon/ssi-sdk.data-store';
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
import {RootState, ToastTypeEnum} from '../../types';
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
import {CredentialSummary, toCredentialSummary} from '@sphereon/ui-components.credential-branding';
import {getCredentialIssuerContact} from '../../utils';

export const getVerifiableCredentials = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    getVerifiableCredentialsFromStorage()
      .then(async (credentials: Array<UniqueVerifiableCredential>): Promise<void> => {
        const vcHashes: Array<{vcHash: string}> = credentials.map((uniqueCredential: UniqueVerifiableCredential): {vcHash: string} => ({
          vcHash: uniqueCredential.hash,
        }));
        const credentialsBranding: Array<ICredentialBranding> = await ibGetCredentialBranding({filter: vcHashes});
        const credentialSummaries: Array<CredentialSummary> = await Promise.all(
          credentials.map(async (uniqueVC: UniqueVerifiableCredential): Promise<CredentialSummary> => {
            const credentialBranding: ICredentialBranding | undefined = credentialsBranding.find(
              (branding: ICredentialBranding): boolean => branding.vcHash === uniqueVC.hash,
            );
            return await toCredentialSummary(uniqueVC, credentialBranding?.localeBranding, getCredentialIssuerContact(uniqueVC.verifiableCredential));
          }),
        );
        dispatch({type: GET_CREDENTIALS_SUCCESS, payload: [...credentialSummaries]});
      })
      .catch(() => dispatch({type: GET_CREDENTIALS_FAILED}));
  };
};

export const storeVerifiableCredential = (vc: VerifiableCredential): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    const mappedVc: VerifiableCredential = CredentialMapper.toUniformCredential(vc as OriginalVerifiableCredential) as VerifiableCredential;
    storeCredential({vc: mappedVc})
      .then(async (hash: string): Promise<CredentialSummary> => {
        const credentialBranding: Array<ICredentialBranding> = await ibGetCredentialBranding({filter: [{vcHash: hash}]});
        return toCredentialSummary({verifiableCredential: mappedVc, hash}, credentialBranding?.[0]?.localeBranding);
      })
      .then((summary: CredentialSummary): void => {
        dispatch({
          type: STORE_CREDENTIAL_SUCCESS,
          payload: summary,
        });
        showToast(ToastTypeEnum.TOAST_SUCCESS, {
          message: translate('credential_offer_accepted_toast'),
          showBadge: false,
        });
      })
      .catch(() => dispatch({type: STORE_CREDENTIAL_FAILED}));
  };
};

export const dispatchVerifiableCredential = (
  credentialHash: string,
  vc: VerifiableCredential,
): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    const mappedVc: VerifiableCredential = CredentialMapper.toUniformCredential(vc as OriginalVerifiableCredential) as VerifiableCredential;
    ibGetCredentialBranding({filter: [{vcHash: credentialHash}]})
      .then((credentialBranding: Array<ICredentialBranding>) => {
        const issuer: Party | undefined = getCredentialIssuerContact(mappedVc);
        return toCredentialSummary({verifiableCredential: mappedVc, hash: credentialHash}, credentialBranding?.[0]?.localeBranding, issuer);
      })
      .then((summary: CredentialSummary): void => {
        dispatch({
          type: STORE_CREDENTIAL_SUCCESS,
          payload: summary,
        });
        showToast(ToastTypeEnum.TOAST_SUCCESS, {
          message: translate('credential_offer_accepted_toast'),
          showBadge: false,
        });
      })
      .catch(() => dispatch({type: STORE_CREDENTIAL_FAILED}));
  };
};

export const deleteVerifiableCredential = (credentialHash: string): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    deleteCredential({hash: credentialHash})
      .then((isDeleted: boolean): void => {
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
      .catch((): void => {
        dispatch({type: DELETE_CREDENTIAL_FAILED});
        showToast(ToastTypeEnum.TOAST_ERROR, {message: translate('credential_deleted_failed_toast')});
      });
  };
};

export const createVerifiableCredential = (args: ICreateVerifiableCredentialArgs): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    createCredential(args)
      .then((vc: VerifiableCredential): void => {
        storeCredential({vc}).then((hash: string) =>
          toCredentialSummary({verifiableCredential: vc, hash}).then((summary: CredentialSummary) =>
            // TODO fix mismatch in types
            dispatch({
              type: CREATE_CREDENTIAL_SUCCESS,
              payload: summary,
            }),
          ),
        );
      })
      .catch(() => dispatch({type: CREATE_CREDENTIAL_FAILED}));
  };
};
