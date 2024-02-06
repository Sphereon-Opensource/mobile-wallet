import {IIdentifier, IKey} from '@veramo/core';

import {DID_PREFIX} from '../@config/constants';
import {didManagerCreate, didManagerFind, didManagerGet} from '../agent';
import store from '../store';
import {getContacts} from '../store/actions/contact.actions';
import {addIdentifier} from '../store/actions/user.actions';
import {ICreateIdentifierArgs, ICreateOrGetIdentifierArgs, IdentifierAliasEnum, KeyManagementSystemEnum} from '../types';

export const getIdentifiers = async (): Promise<IIdentifier[]> => {
  // TODO fully implement
  return didManagerFind();
};

export const createIdentifier = async (args?: ICreateIdentifierArgs): Promise<IIdentifier> => {
  const identifier = await didManagerCreate({
    kms: args?.createOpts?.kms ?? KeyManagementSystemEnum.LOCAL,
    ...(args?.method && {provider: `${DID_PREFIX}:${args?.method}`}),
    alias: args?.createOpts?.alias ?? `${IdentifierAliasEnum.PRIMARY}-${args?.method}-${args?.createOpts?.options?.type}-${new Date().toUTCString()}`,
    options: args?.createOpts?.options,
  });

  if (store.getState().user.users.size > 0) {
    await store.dispatch<any>(addIdentifier({did: identifier.did})).then(() => {
      setTimeout(() => {
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

  console.log(`created identifier: ${JSON.stringify(identifier, null, 2)}`);
  return didManagerGet({did: identifier.did});
};
