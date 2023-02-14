import { ICredential } from '@sphereon/ssi-types'
import { ICredentialStatus } from '@sphereon/ssi-types/src/types/vc'

import { CredentialStatusEnum, ICredentialSummary } from '../@types'

import DateUtils from './DateUtils'

export const getCredentialStatus = (credential: ICredential | ICredentialSummary): CredentialStatusEnum => {
  if (isRevoked(credential?.credentialStatus)) {
    return CredentialStatusEnum.REVOKED
  } else if (isExpired(credential?.expirationDate)) {
    return CredentialStatusEnum.EXPIRED
  }

  return CredentialStatusEnum.VALID
}

/**
 * @param credentialStatus a status value or reference to the status information. For example the CredentialStatusEnum has the value. ICredentialStatus can have the reference to the status which can be checked by fetching this status from a server.
 * @return
 *          true means the credential is revoked.
 *          false means the credential is not revoked.
 *          other exit path like exception or an undefined as returned value means it could not be determined.
 */
export const isRevoked = (
  credentialStatus: CredentialStatusEnum | ICredentialStatus | undefined
): boolean | undefined => {
  if (credentialStatus === CredentialStatusEnum.REVOKED) {
    return true
  }
  // FIXME if credentialStatus is of type ICredentialStatus then it may have following structure. For this we may need to make a network call to confirm the status.
  // This should be done in a separate ticket.
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
 *          true means the credential is expired.
 *          false means the credential is not expired.
 *          other exit path like exception or an undefined as returned value means it could not be determined.
 */
export const isExpired = (expirationDate: string | number | undefined): boolean | undefined => {
  let expirationDateNum = 0
  if (expirationDate) {
    if (typeof expirationDate === 'string') {
      expirationDateNum = new Date(expirationDate).valueOf() / DateUtils.EPOCH_MILLISECONDS
    } else {
      expirationDateNum = expirationDate
    }
  }

  if (expirationDate && expirationDateNum < new Date().valueOf() / 1000) {
    return true
  }
}
