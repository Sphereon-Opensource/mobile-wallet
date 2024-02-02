import {IIdentifier, IKey} from '@veramo/core';

import {DID_PREFIX} from '../@config/constants';
import {agentContext, didManagerCreate, didManagerFind, didManagerGet} from '../agent';
import store from '../store';
import {getContacts} from '../store/actions/contact.actions';
import {addIdentifier} from '../store/actions/user.actions';
import {ICreateIdentifierArgs, ICreateOrGetIdentifierArgs, IdentifierAliasEnum, KeyManagementSystemEnum} from '../types';
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

const logger: EventLogger = new EventLoggerBuilder()
  .withContext(agentContext)
  .withLogLevel(LogLevel.INFO)
  .withSystem(System.IDENTITY)
  .withSubSystem(SubSystem.DID_PROVIDER)
  .withInitiatorType(InitiatorType.SYSTEM)
  .build();

export const getIdentifiers = async (): Promise<IIdentifier[]> => {
  // TODO fully implement
  return didManagerFind();
};

export const createIdentifier = async (args?: ICreateIdentifierArgs): Promise<IIdentifier> => {
  const identifier = await didManagerCreate({
    kms: args?.createOpts?.kms || KeyManagementSystemEnum.LOCAL,
    ...(args?.method && {provider: `${DID_PREFIX}:${args?.method}`}),
    alias: args?.createOpts?.alias || `${IdentifierAliasEnum.PRIMARY}-${args?.method}-${args?.createOpts?.options?.type}-${new Date().toUTCString()}`,
    options: args?.createOpts?.options,
  });

  await logger.logEvent({
    type: LoggingEventType.AUDIT,
    data: {
      description: 'identifier created',
      actionType: ActionType.CREATE,
      actionSubType: DefaultActionSubType.DID_CREATION,
      data: identifier,
      diagnosticData: args,
    },
  });

  if (store.getState().user.users.size > 0) {
    await store.dispatch<any>(addIdentifier({did: identifier.did})).then((): void => {
      setTimeout((): void => {
        store.dispatch<any>(getContacts());
      }, 1000);
    });
  }

  return identifier;
};

export const getOrCreatePrimaryIdentifier = async (args?: ICreateOrGetIdentifierArgs): Promise<IIdentifier> => {
  const identifiers = (await didManagerFind(args?.method ? {provider: `${DID_PREFIX}:${args?.method}`} : {})).filter(
    (identifier: IIdentifier) =>
      args?.createOpts?.options?.type === undefined || identifier.keys.some((key: IKey) => key.type === args?.createOpts?.options?.type),
  );

  console.log(`Currently available identifiers for ${args?.method} / ${args?.createOpts?.options?.type}: ${identifiers.length}`);

  // Currently we only support one identifier
  const identifier: IIdentifier = !identifiers || identifiers.length == 0 ? await createIdentifier(args) : identifiers[0];

  return didManagerGet({did: identifier.did});
};
