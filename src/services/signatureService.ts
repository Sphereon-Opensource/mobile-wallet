import { PresentationSignCallBackParams } from '@sphereon/pex'
import { W3CVerifiablePresentation } from '@sphereon/ssi-types'
import { IIdentifier } from '@veramo/core'
import { createJWT, Signer } from 'did-jwt'

import { ISignJwtArgs } from '../@types'
import { keyManagerSign } from '../agent'
import { SignatureAlgorithmFromKey } from '../utils/KeyUtils'

export const signJWT = async (args: ISignJwtArgs): Promise<string> => {
  const options = {
    ...args.options,
    signer: getSigner(args.identifier)
  }

  return createJWT(args.payload, options, args.header)
}

const getSigner = (identifier: IIdentifier): Signer => {
  // TODO currently we assume an identifier only has one key
  const key = identifier.keys[0]
  // TODO See if this is mandatory for a correct JWT
  const algorithm = SignatureAlgorithmFromKey(key)

  return async (data: string | Uint8Array): Promise<string> => {
    const input =
      data instanceof Object.getPrototypeOf(Uint8Array)
        ? new TextDecoder().decode(data as Uint8Array)
        : (data as string)

    return await keyManagerSign({
      keyRef: key.kid,
      algorithm,
      data: input
    })
  }
}

// TODO implement presentation signing
export const signPresentation = async (args: PresentationSignCallBackParams): Promise<W3CVerifiablePresentation> => {
  return ''
}
