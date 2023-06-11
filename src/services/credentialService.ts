import {CredentialMapper, IVerifyResult, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {ICreateVerifiableCredentialArgs, UniqueVerifiableCredential, VerifiableCredential} from '@veramo/core';
import {IVerifyCredentialArgs} from '@veramo/core/src/types/ICredentialVerifier';

import agent, {
  dataStoreDeleteVerifiableCredential,
  dataStoreGetVerifiableCredential,
  dataStoreORMGetVerifiableCredentials,
  dataStoreSaveVerifiableCredential,
  createVerifiableCredential as issueVerifiableCredential,
} from '../agent';
import {
  IDeleteVerifiableCredentialArgs,
  IGetVerifiableCredentialArgs,
  IStoreVerifiableCredentialArgs,
  IVerificationResult,
  IVerificationSubResult,
} from '../types';

import {removeCredentialBranding} from './brandingService';

export const getVerifiableCredentialsFromStorage = async (): Promise<Array<UniqueVerifiableCredential>> => {
  return dataStoreORMGetVerifiableCredentials();
};

export const storeVerifiableCredential = async (args: IStoreVerifiableCredentialArgs): Promise<string> => {
  return dataStoreSaveVerifiableCredential({verifiableCredential: args.vc});
};

export const getVerifiableCredential = async (args: IGetVerifiableCredentialArgs): Promise<VerifiableCredential> => {
  return dataStoreGetVerifiableCredential({hash: args.hash});
};

export const deleteVerifiableCredential = async (args: IDeleteVerifiableCredentialArgs): Promise<boolean> => {
  return removeCredentialBranding({filter: [{vcHash: args.hash}]}).then(() => dataStoreDeleteVerifiableCredential({hash: args.hash}));
};

export const createVerifiableCredential = async (args: ICreateVerifiableCredentialArgs): Promise<VerifiableCredential> => {
  return issueVerifiableCredential(args);
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
