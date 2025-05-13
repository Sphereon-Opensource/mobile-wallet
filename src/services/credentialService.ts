import {DocumentType, OptionalUniqueDigitalCredential, UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {AddDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {DigitalCredential, RegulationType} from '@sphereon/ssi-sdk.data-store';
import {
  ActionType,
  CredentialMapper,
  DefaultActionSubType,
  InitiatorType,
  IVerifyResult,
  LogLevel,
  OriginalVerifiableCredential,
  SubSystem,
  System,
  W3CVerifiableCredential,
} from '@sphereon/ssi-types';
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
import store from '../store';
import {storeAuditLogging} from '../store/actions/logging.actions';
import {generateDigest} from '../utils';

export const getVerifiableCredentialsFromStorage = async (opts?: {
  regulationTypes?: RegulationType[];
  parentsOnly?: boolean;
}): Promise<Array<UniqueDigitalCredential>> => {
  const regulationTypes = opts?.regulationTypes;
  const parentsOnly = opts?.parentsOnly ?? true;
  return agent.crsGetUniqueCredentials({filter: [{documentType: DocumentType.VC}]}).then((creds: Array<UniqueDigitalCredential>) => {
    const filtered = creds
      .filter(cred => !regulationTypes || !cred.digitalCredential.regulationType || regulationTypes.includes(cred.digitalCredential.regulationType))
      .filter(cred => !parentsOnly || cred.digitalCredential.parentId === null || cred.digitalCredential.parentId === undefined); // filter out any instances
    return filtered;
  });
};

export const storeVerifiableCredential = async (args: IStoreVerifiableCredentialArgs): Promise<DigitalCredential> => {
  const {vc, kmsKeyRef, credentialRole, issuerCorrelationId, issuerCorrelationType}: IStoreVerifiableCredentialArgs = args;
  const rawDocument = typeof vc === 'string' ? vc : JSON.stringify(vc);
  const uniformDocument = CredentialMapper.toUniformCredential(vc as W3CVerifiableCredential, {hasher: generateDigest});
  const sub = Array.isArray(uniformDocument.credentialSubject) ? uniformDocument.credentialSubject?.[0]?.id : uniformDocument.credentialSubject?.id;

  const addCredential: AddDigitalCredential = {
    rawDocument: rawDocument,
    issuerCorrelationId: issuerCorrelationId,
    issuerCorrelationType: issuerCorrelationType,
    credentialRole: credentialRole,
    kmsKeyRef,
    identifierMethod: sub?.startsWith('did:') ?? issuerCorrelationId.startsWith('did:') ? 'did' : 'jwk',
  };
  return agent.crsAddCredential({credential: addCredential});
};

export const getVerifiableCredential = async (args: IGetVerifiableCredentialArgs): Promise<UniqueDigitalCredential> => {
  const {credentialRole, hash} = args;
  try {
    const uniqueCredential: OptionalUniqueDigitalCredential = await agent.crsGetUniqueCredentialByIdOrHash({credentialRole, idOrHash: hash});
    if (uniqueCredential === undefined) {
      return Promise.reject(Error(`DigitalCredential with hash ${hash} was not found ${JSON.stringify(hash)}`));
    }
    if (typeof uniqueCredential.uniformVerifiableCredential === 'string') {
      // fixme
      uniqueCredential.uniformVerifiableCredential = JSON.parse(uniqueCredential.uniformVerifiableCredential);
    }
    return uniqueCredential;
  } catch (e) {
    // @ts-ignore
    return Promise.reject(new Error(`Fetching of credential with ${hash} and credential role ${credentialRole} was not found: ${e}`, {cause: e}));
  }
};

export const deleteVerifiableCredential = async (args: IDeleteVerifiableCredentialArgs): Promise<boolean> => {
  const {hash} = args;

  return removeCredentialBranding({filter: [{vcHash: hash}]})
    .then(() => agent.crsDeleteCredential({hash}))
    .then(deletionResult => {
      store.dispatch<any>(
        storeAuditLogging({
          subSystemType: SubSystem.OID4VP_OP,
          initiatorType: InitiatorType.SYSTEM,
          level: LogLevel.INFO,
          system: System.CREDENTIALS,
          description: 'Credential was deleted by the user',
          actionType: ActionType.DELETE,
          actionSubType: DefaultActionSubType.VC_DELETE,
          diagnosticData: args,
        }),
      );
      return deletionResult;
    });
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
