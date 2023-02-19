import { ICredential } from '@sphereon/ssi-types'

import { CredentialStatusEnum, ICredentialSummary } from '../types'

import { EPOCH_MILLISECONDS } from './DateUtils'

export const getCredentialStatus = (credential: ICredential | ICredentialSummary): CredentialStatusEnum => {
  if (isRevoked()) {
    return CredentialStatusEnum.REVOKED
  } else if (isExpired(credential.expirationDate)) {
    return CredentialStatusEnum.EXPIRED
  }

  return CredentialStatusEnum.VALID
}

/**
 * @param credentialStatus a status value or reference to the status information. For example the CredentialStatusEnum has the value. ICredentialStatus can have the reference to the status which can be checked by fetching this status from a server.
 * @return
 *  true means the credential is revoked.
 *  false means the credential is not revoked.
 */
export const isRevoked = (): boolean => {
  return false
  // TODO implement
  // {
  //  id: 'https://revocation-sphereon.sphereon.io/services/credentials/wallet-dev#2022021400',
  //  type: 'RevocationList2022021401Status',
  //  revocationListIndex: '2022021402',
  //  revocationListCredential: 'https://revocation-sphereon.sphereon.io/services/credentials/wallet-dev#2022021400',
  // }
}

/**
 * @param expirationDate The number of milliseconds between 1 January 1970 00:00:00 UTC and the given date or a formatted date required by Date(...)
 * @return
 *  true means the credential is expired.
 *  false means the credential is not expired.
 */
export const isExpired = (value?: string | number): boolean => {
  if (!value) {
    return false
  }
  const expirationDate = typeof value === 'string' ? new Date(value).valueOf() / EPOCH_MILLISECONDS : value

  return expirationDate < Date.now()
}
