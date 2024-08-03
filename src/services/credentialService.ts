import {CredentialMapper, IVerifyResult, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {ICreateVerifiableCredentialArgs, IVerifyCredentialArgs, VerifiableCredential} from '@veramo/core';

import agent from '../agent';
import {
  IDeleteVerifiableCredentialArgs,
  IGetVerifiableCredentialArgs,
  IStoreVerifiableCredentialArgs,
  IVerificationResult,
  IVerificationSubResult,
} from '../types';

import {removeCredentialBranding} from './brandingService';
import {DocumentType, UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {AddDigitalCredential} from '@sphereon/ssi-sdk.credential-store/src/types/ICredentialStore';

export const getVerifiableCredentialsFromStorage = async (): Promise<Array<UniqueDigitalCredential>> => {
  return agent.crsGetUniqueCredentials({filter: [{documentType: DocumentType.VC}]});
};

export const storeVerifiableCredential = async (args: IStoreVerifiableCredentialArgs): Promise<string> => {
  const {vc, credentialRole, issuerCorrelationId, issuerCorrelationType}: IStoreVerifiableCredentialArgs = args;
  const rawDocument = JSON.stringify(vc);
  const addCredential: AddDigitalCredential = {
    rawDocument: rawDocument,
    issuerCorrelationId: issuerCorrelationId,
    issuerCorrelationType: issuerCorrelationType,
    credentialRole: credentialRole,
  };
  const digitalCredential = await agent.crsAddCredential({credential: addCredential});
  return digitalCredential.hash;
};

export const getVerifiableCredential = async (args: IGetVerifiableCredentialArgs): Promise<VerifiableCredential> => {
  const {credentialRole, hash} = args;
  try {
    const uniqueCredential = await agent.crsGetUniqueCredentialByIdOrHash({credentialRole, idOrHash: hash});
    if (uniqueCredential === undefined) {
      return Promise.reject(Error(`DigitalCredential with hash ${hash} was not found ${JSON.stringify(hash)}`));
    }
    return uniqueCredential.originalVerifiableCredential as VerifiableCredential;
  } catch (e) {
    // @ts-ignore
    return Promise.reject(new Error(`Fetching of credential with ${hash} and credential role ${credentialRole} was not found: ${e}`, {cause: e}));
  }
};

export const deleteVerifiableCredential = async (args: IDeleteVerifiableCredentialArgs): Promise<boolean> => {
  return removeCredentialBranding({filter: [{vcHash: args.hash}]}).then(() => agent.crsDeleteCredential({hash: args.hash}));
};

export const createVerifiableCredential = async (args: ICreateVerifiableCredentialArgs): Promise<VerifiableCredential> => {
  return agent.createVerifiableCredential(args);
};

export const verifyCredential = async (args: IVerifyCredentialArgs): Promise<IVerificationResult> => {
  // We also allow/add boolean, because 4.x Veramo returns a boolean for JWTs. 5.X will return better results
  const result: IVerifyResult | boolean = (await agent.verifyCredential(args)) as IVerifyResult | boolean;

  if (typeof result === 'boolean') {
    return {
      source: CredentialMapper.toWrappedVerifiableCredential(args.credential as OriginalVerifiableCredential),
      result,
      ...(!result && {
        error: 'Invalid JWT VC',
        errorDetails: `JWT VC could was not valid with policies: ${JSON.stringify(args.policies)}`,
      }),
      subResults: [],
    };
  } else {
    const subResults: IVerificationSubResult[] = [];
    let error: string | undefined;
    let errorDetails: string | undefined;
    if (result.error) {
      error = result.error?.message ?? '';
      errorDetails = result.error?.details?.code ?? '';
      errorDetails = (errorDetails !== '' ? `${errorDetails}, ` : '') + (result.error?.details?.url ?? '');
      if (result.error?.errors) {
        error = (error !== '' ? `${error}, ` : '') + result.error?.errors?.map(error => error.message ?? error.name).join(', ');
        errorDetails =
          (errorDetails !== '' ? `${errorDetails}, ` : '') +
          result.error?.errors?.map(error => (error?.details?.code ? `${error.details.code}, ` : '') + (error?.details?.url ?? '')).join(', ');
      }
    }

    return {
      source: CredentialMapper.toWrappedVerifiableCredential(args.credential as OriginalVerifiableCredential),
      result: result.verified,
      subResults,
      error,
      errorDetails,
    };
  }
};
