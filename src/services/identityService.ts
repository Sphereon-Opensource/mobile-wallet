import { IIdentifier, IKey } from '@veramo/core'

import { DID_PREFIX } from '../@config/constants'
import { ICreateOrGetIdentifierArgs, IdentifierAliasEnum, KeyManagementSystemEnum } from '../@types'
import { didManagerCreate, didManagerFind, didManagerGet } from '../agent'

export const getIdentifiers = async (): Promise<IIdentifier[]> => {
  // TODO fully implement
  return didManagerFind()
}

export const createIdentifier = async (): Promise<IIdentifier> => {
  // TODO fully implement
  return didManagerCreate()
}

export const getOrCreatePrimaryIdentifier = async (args?: ICreateOrGetIdentifierArgs): Promise<IIdentifier> => {
  const identifiers = (await didManagerFind(args?.method ? { provider: `${DID_PREFIX}:${args?.method}` } : {})).filter(
    (identifier) =>
      args?.createOpts?.options?.type === undefined ||
      identifier.keys.some((key: IKey) => key.type === args?.createOpts?.options?.type)
  )

  console.log(
    `Currently available identifiers for ${args?.method} / ${args?.createOpts?.options?.type}: ${identifiers.length}`
  )

  // Currently we only support one identifier
  const identifier =
    !identifiers || identifiers.length == 0
      ? await didManagerCreate({
          kms: args?.createOpts?.kms || KeyManagementSystemEnum.LOCAL,
          ...(args?.method && { provider: `${DID_PREFIX}:${args?.method}` }),
          alias:
            args?.createOpts?.alias ||
            `${IdentifierAliasEnum.PRIMARY}-${args?.method}-${args?.createOpts?.options?.type}`,
          options: args?.createOpts?.options
        })
      : identifiers[0]

  return didManagerGet({ did: identifier.did })
}
