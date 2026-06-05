import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {CredentialCorrelationType, DigitalCredential, ICredentialBranding, Party} from '@sphereon/ssi-sdk.data-store-types';
import {CredentialMapper, CredentialRole, Loggers, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {CredentialSummary, toCredentialSummary} from '@sphereon/ui-components.credential-branding';
import {ICreateVerifiableCredentialArgs, VerifiableCredential} from '@veramo/core';
import {Action} from 'redux';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import agent from '../../agent';
import {translate} from '../../localization/Localization';
import MobileDriversLicenseBranding from '../../@config/branding/MobileDriversLicenseBranding.json';
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
import {getCredentialIssuerContact, getCredentialSubjectContact, showToast} from '../../utils';

export const logger = Loggers.DEFAULT.get('sphereon:store');

const WALLET_IDENTITY_CLAIM_LABELS: Record<string, string> = {
  firstName: 'account_first_name_label',
  lastName: 'account_last_name_label',
  emailAddress: 'account_email_label',
};

const MDL_CLAIM_LABELS: Record<string, string> = {
  family_name: 'mdl_claim_family_name',
  given_name: 'mdl_claim_given_name',
  birth_date: 'mdl_claim_birth_date',
  portrait: 'mdl_claim_portrait',
  issue_date: 'mdl_claim_issue_date',
  expiry_date: 'mdl_claim_expiry_date',
  issuing_authority: 'mdl_claim_issuing_authority',
  issuing_country: 'mdl_claim_issuing_country',
  document_number: 'mdl_claim_document_number',
  document_name: 'mdl_claim_document_name',
  driving_privileges: 'mdl_claim_driving_privileges',
  un_distinguishing_sign: 'mdl_claim_un_distinguishing_sign',
  age_over_18: 'mdl_claim_age_over_18',
  age_over_21: 'mdl_claim_age_over_21',
  nationality: 'mdl_claim_nationality',
  resident_city: 'mdl_claim_resident_city',
  resident_address: 'mdl_claim_resident_address',
  resident_postal_code: 'mdl_claim_resident_postal_code',
  resident_country: 'mdl_claim_resident_country',
  signature_usual_mark: 'mdl_claim_signature',
};

const localizeCredentialProperties = (summary: CredentialSummary): CredentialSummary => {
  let labelMap: Record<string, string> | undefined;
  if (summary.title === 'SphereonWalletIdentityCredential') {
    labelMap = WALLET_IDENTITY_CLAIM_LABELS;
  } else if (summary.title === 'org.iso.18013.5.1.mDL' || summary.title === 'MDL') {
    labelMap = MDL_CLAIM_LABELS;
  }
  if (!labelMap) return summary;
  return {
    ...summary,
    properties: summary.properties.map(row => {
      const translationKey = labelMap![row.label];
      return translationKey ? {...row, label: translate(translationKey)} : row;
    }),
  };
};

export const getVerifiableCredentials = (): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    getVerifiableCredentialsFromStorage()
      .then(async (credentials: Array<UniqueDigitalCredential>): Promise<void> => {
        const vcHashes: Array<{vcHash: string}> = credentials.map((uniqueCredential: UniqueDigitalCredential): {vcHash: string} => ({
          vcHash: uniqueCredential.hash,
        }));
        const credentialsBranding: Array<ICredentialBranding> = await agent.ibGetCredentialBranding({filter: vcHashes});
        const credentialSummaries: Array<CredentialSummary> = await Promise.all(
          credentials.map(async (uniqueVC: UniqueDigitalCredential): Promise<CredentialSummary> => {
            const credentialBranding: ICredentialBranding | undefined = credentialsBranding.find(
              (branding: ICredentialBranding): boolean => branding.vcHash === uniqueVC.hash,
            );
            // todo: we should get uniform from the store instead of having to map it. We store it for a reason
            const uniform = JSON.parse(uniqueVC.digitalCredential.uniformDocument) as VerifiableCredential;
            console.log(JSON.stringify(uniform));
            console.log(`Pre to summary with\r\n:${JSON.stringify(uniform, null, 2)}`);
            // Apply default mDL branding when issuer provides no visual branding
            let branding = credentialBranding?.localeBranding;
            const hasVisualBranding = branding?.some((b: any) => b.logo?.uri || b.background?.image?.uri || b.background?.color);
            if (!hasVisualBranding && uniform.type?.includes('org.iso.18013.5.1.mDL')) {
              const mdlBranding = {...MobileDriversLicenseBranding, ...(branding?.[0] ?? {})} as any;
              // Ensure mDL visual properties are applied even if issuer provided partial branding
              if (!mdlBranding.logo?.uri) mdlBranding.logo = MobileDriversLicenseBranding.logo;
              if (!mdlBranding.background?.color && !mdlBranding.background?.image) mdlBranding.background = MobileDriversLicenseBranding.background;
              if (!mdlBranding.text?.color) mdlBranding.text = MobileDriversLicenseBranding.text;
              branding = [mdlBranding];
            }
            return toCredentialSummary({
              verifiableCredential: uniform,
              hash: uniqueVC.hash,
              credentialRole: uniqueVC.digitalCredential.credentialRole,
              branding,
              issuer: getCredentialIssuerContact(uniform),
              subject: getCredentialSubjectContact(uniform),
            })
              .then(localizeCredentialProperties)
              .then(
                (summary: CredentialSummary): CredentialSummary =>
                  ({...summary, verifiedState: uniqueVC.digitalCredential.verifiedState} as CredentialSummary),
              );
          }),
        );
        console.log('summaries', credentialSummaries);
        dispatch({type: GET_CREDENTIALS_SUCCESS, payload: [...credentialSummaries]});
      })
      .catch(e => {
        console.error(e);
        dispatch({type: GET_CREDENTIALS_FAILED});
      });
  };
};

export const storeVerifiableCredential = (vc: VerifiableCredential): ThunkAction<Promise<void>, RootState, unknown, Action> => {
  return async (dispatch: ThunkDispatch<RootState, unknown, Action>): Promise<void> => {
    dispatch({type: CREDENTIALS_LOADING});
    console.log(`ORIG RAW VC: ${vc}`);
    const mappedVc: VerifiableCredential = CredentialMapper.toUniformCredential(vc as OriginalVerifiableCredential) as VerifiableCredential;
    const issuer = typeof mappedVc.issuer === 'object' ? mappedVc.issuer.id : mappedVc.issuer;
    storeCredential({
      credentialRole: CredentialRole.HOLDER,
      issuerCorrelationId: `${issuer}`,
      issuerCorrelationType: issuer && issuer.startsWith('did:') ? CredentialCorrelationType.DID : CredentialCorrelationType.URL,
      vc: vc,
    } satisfies IStoreVerifiableCredentialArgs)
      .then(async (digitalCredential: DigitalCredential): Promise<CredentialSummary> => {
        const credentialBranding: Array<ICredentialBranding> = await agent.ibGetCredentialBranding({filter: [{vcHash: digitalCredential.hash}]});
        return toCredentialSummary({
          verifiableCredential: mappedVc,
          hash: digitalCredential.hash,
          credentialRole: CredentialRole.HOLDER,
          branding: credentialBranding?.[0]?.localeBranding,
          issuer: getCredentialIssuerContact(mappedVc),
          subject: getCredentialSubjectContact(mappedVc),
        }).then(localizeWalletIdentityProperties);
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
    agent
      .ibGetCredentialBranding({filter: [{vcHash: credentialHash}]})
      .then((credentialBranding: Array<ICredentialBranding>) => {
        const issuer: Party | undefined = getCredentialIssuerContact(mappedVc);
        return toCredentialSummary({
          verifiableCredential: mappedVc,
          hash: credentialHash,
          credentialRole: CredentialRole.HOLDER,
          branding: credentialBranding?.[0]?.localeBranding,
          issuer,
          subject: getCredentialSubjectContact(mappedVc),
        }).then(localizeWalletIdentityProperties);
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
          kmsKeyRef: args.keyRef,
          vc,
        } satisfies IStoreVerifiableCredentialArgs).then((digitalCredential: DigitalCredential) =>
          toCredentialSummary({
            verifiableCredential: vc,
            hash: digitalCredential.hash,
            credentialRole: CredentialRole.HOLDER,
            issuer: getCredentialIssuerContact(vc),
            subject: getCredentialSubjectContact(vc),
          })
            .then(localizeWalletIdentityProperties)
            .then((summary: CredentialSummary) =>
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
