import {CredentialRole, DigitalCredential, ICredentialBranding, Party} from '@sphereon/ssi-sdk.data-store';
import {CredentialMapper, Loggers, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {ICreateVerifiableCredentialArgs, VerifiableCredential} from '@veramo/core';
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
import {IStoreVerifiableCredentialArgs, RootState, ToastTypeEnum} from '../../types';
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
import {CredentialCorrelationType} from '@sphereon/ssi-sdk.data-store/src';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';

export const logger = Loggers.DEFAULT.get('sphereon:store');

export const getVerifiableCredentials = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    getVerifiableCredentialsFromStorage()
      .then(async (credentials: Array<UniqueDigitalCredential>): Promise<void> => {
        const vcHashes: Array<{vcHash: string}> = credentials.map((uniqueCredential: UniqueDigitalCredential): {vcHash: string} => ({
          vcHash: uniqueCredential.hash,
        }));
        const credentialsBranding: Array<ICredentialBranding> = await ibGetCredentialBranding({filter: vcHashes});
        const credentialSummaries: Array<CredentialSummary> = await Promise.all(
          credentials.map(async (uniqueVC: UniqueDigitalCredential): Promise<CredentialSummary> => {
            const credentialBranding: ICredentialBranding | undefined = credentialsBranding.find(
              (branding: ICredentialBranding): boolean => branding.vcHash === uniqueVC.hash,
            );
            return await toCredentialSummary(
              uniqueVC.originalVerifiableCredential as VerifiableCredential,
              uniqueVC.hash,
              uniqueVC.digitalCredential.credentialRole,
              credentialBranding?.localeBranding,
              await getCredentialIssuerContact(uniqueVC.originalVerifiableCredential as VerifiableCredential),
            );
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
    storeCredential({
      credentialRole: CredentialRole.HOLDER,
      issuerCorrelationId: `${vc.issuer}`,
      issuerCorrelationType: CredentialCorrelationType.DID,
      vc: mappedVc,
    } satisfies IStoreVerifiableCredentialArgs)
      .then(async (hash: string): Promise<CredentialSummary> => {
        const credentialBranding: Array<ICredentialBranding> = await ibGetCredentialBranding({filter: [{vcHash: hash}]});
        return toCredentialSummary(mappedVc, hash, CredentialRole.HOLDER, credentialBranding?.[0]?.localeBranding);
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
  credential: DigitalCredential,
): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    const mappedVc: VerifiableCredential = JSON.parse(credential.uniformDocument) as VerifiableCredential;
    ibGetCredentialBranding({filter: [{vcHash: credentialHash}]})
      .then((credentialBranding: Array<ICredentialBranding>) => {
        const issuer: Party | undefined = getCredentialIssuerContact(mappedVc);
        return toCredentialSummary(mappedVc, credentialHash, CredentialRole.HOLDER, credentialBranding?.[0]?.localeBranding, issuer);
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
      .catch((e: Error) => {
        logger.error('dispatchVerifiableCredential failed', e);
        return dispatch({type: STORE_CREDENTIAL_FAILED});
      });
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
      .catch((reason): void => {
        logger.error('delete credential failed:', reason);
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
        storeCredential({
          credentialRole: CredentialRole.HOLDER,
          issuerCorrelationId: `${vc.issuer}`,
          issuerCorrelationType: CredentialCorrelationType.DID,
          vc,
        } satisfies IStoreVerifiableCredentialArgs).then((hash: string) =>
          toCredentialSummary(vc, hash, CredentialRole.HOLDER).then((summary: CredentialSummary) =>
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
