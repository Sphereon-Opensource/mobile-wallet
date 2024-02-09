import {CredentialMapper, IVerifyResult, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {
  ActionType,
  DefaultActionSubType,
  EventLogger,
  EventLoggerBuilder,
  InitiatorType,
  LoggingEventType,
  LogLevel,
  SubSystem,
  System,
} from '@sphereon/ssi-sdk.core';
import {ICreateVerifiableCredentialArgs, IVerifyCredentialArgs, UniqueVerifiableCredential, VerifiableCredential} from '@veramo/core';

import agent, {
  agentContext,
  createVerifiableCredential as issueVerifiableCredential,
  dataStoreDeleteVerifiableCredential,
  dataStoreGetVerifiableCredential,
  dataStoreORMGetVerifiableCredentials,
  dataStoreSaveVerifiableCredential,
} from '../agent';
import {
  IDeleteVerifiableCredentialArgs,
  IGetVerifiableCredentialArgs,
  IStoreVerifiableCredentialArgs,
  IVerificationResult,
  IVerificationSubResult,
} from '../types';
import {removeCredentialBranding} from './brandingService';

const logger: EventLogger = new EventLoggerBuilder()
  .withContext(agentContext)
  .withLogLevel(LogLevel.INFO)
  .withSystem(System.CREDENTIALS)
  .withSubSystem(SubSystem.VC_PERSISTENCE)
  .withInitiatorType(InitiatorType.SYSTEM)
  .build();

export const getVerifiableCredentialsFromStorage = async (): Promise<Array<UniqueVerifiableCredential>> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      level: LogLevel.TRACE,
      description: 'getVerifiableCredentialsFromStorage function call',
      actionType: ActionType.READ,
      actionSubType: 'get credentials',
    },
  });

  return dataStoreORMGetVerifiableCredentials();
};

export const storeVerifiableCredential = async (args: IStoreVerifiableCredentialArgs): Promise<string> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      description: 'storeVerifiableCredential function call',
      actionType: ActionType.CREATE,
      actionSubType: 'store credential',
      initiatorType: InitiatorType.USER,
      diagnosticData: args,
    },
  });

  return dataStoreSaveVerifiableCredential({verifiableCredential: args.vc})
    .then((credentialHash: string) => {
      logger.logEvent({
        type: LoggingEventType.AUDIT,
        data: {
          description: 'credential stored',
          actionType: ActionType.CREATE,
          actionSubType: 'store credential',
          initiatorType: InitiatorType.USER,
          data: credentialHash,
          diagnosticData: args,
        },
      });

      return credentialHash;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to store credential. Error: ${error}`)));
};

export const getVerifiableCredential = async (args: IGetVerifiableCredentialArgs): Promise<VerifiableCredential> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      level: LogLevel.TRACE,
      description: 'getVerifiableCredential function call',
      actionType: ActionType.READ,
      actionSubType: 'get credentials',
      diagnosticData: args,
    },
  });

  return dataStoreGetVerifiableCredential({hash: args.hash});
};

export const deleteVerifiableCredential = async (args: IDeleteVerifiableCredentialArgs): Promise<boolean> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      description: 'deleteVerifiableCredential function call',
      actionType: ActionType.DELETE,
      actionSubType: 'removed credential',
      diagnosticData: args,
    },
  });

  return removeCredentialBranding({filter: [{vcHash: args.hash}]})
    .then(() => dataStoreDeleteVerifiableCredential({hash: args.hash}))
    .then((isDeleted: boolean) => {
      logger.logEvent({
        type: LoggingEventType.AUDIT,
        data: {
          description: isDeleted ? 'verifiable credential removed' : 'verifiable credential not removed',
          actionType: ActionType.DELETE,
          actionSubType: 'remove verifiable credential',
          initiatorType: InitiatorType.USER,
          data: isDeleted,
          diagnosticData: args,
        },
      });

      return isDeleted;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to removed verifiable credential. Error: ${error}`)));
};

export const createVerifiableCredential = async (args: ICreateVerifiableCredentialArgs): Promise<VerifiableCredential> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      description: 'createVerifiableCredential function call',
      actionType: ActionType.CREATE,
      actionSubType: DefaultActionSubType.VC_ISSUE,
      diagnosticData: args,
    },
  });

  return issueVerifiableCredential(args)
    .then((vc: VerifiableCredential) => {
      logger.logEvent({
        type: LoggingEventType.AUDIT,
        data: {
          description: 'verifiable credential issued',
          actionType: ActionType.CREATE,
          actionSubType: DefaultActionSubType.VC_ISSUE,
          initiatorType: InitiatorType.USER,
          data: vc,
          diagnosticData: args,
        },
      });

      return vc;
    })
    .catch((error: Error) => Promise.reject(Error(`Unable to issue verifiable credential. Error: ${error}`)));
};

export const verifyCredential = async (args: IVerifyCredentialArgs): Promise<IVerificationResult> => {
  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      level: LogLevel.TRACE,
      description: 'verifyCredential function call',
      actionType: ActionType.EXECUTE,
      actionSubType: DefaultActionSubType.VC_VERIFY,
      diagnosticData: args,
    },
  });

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

    const verificationResult: IVerificationResult = {
      source: CredentialMapper.toWrappedVerifiableCredential(args.credential as OriginalVerifiableCredential),
      result: result.verified,
      subResults,
      error,
      errorDetails,
    };

    await logger.logEvent({
      type: LoggingEventType.AUDIT,
      data: {
        description: 'verifiable credential verified',
        actionType: ActionType.EXECUTE,
        actionSubType: DefaultActionSubType.VC_VERIFY,
        data: verificationResult,
        diagnosticData: args,
      },
    });

    return verificationResult;
  }
};
