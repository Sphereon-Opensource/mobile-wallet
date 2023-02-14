import { ICredential } from '@sphereon/ssi-types'
import { ICredentialStatus } from '@sphereon/ssi-types/src/types/vc'

import { CredentialStatusEnum, ICredentialSummary } from '../@types'

import DateUtils from "./DateUtils";

class CredentialUtils {
  public static getCredentialStatus(credential: ICredential | ICredentialSummary): CredentialStatusEnum {
    return (
      this.isRevoked(credential?.credentialStatus) ||
      this.isExpired(credential?.expirationDate) ||
      CredentialStatusEnum.VALID
    )
  }

  public static isRevoked(
    credentialStatus: CredentialStatusEnum | ICredentialStatus | undefined
  ): CredentialStatusEnum | undefined {
    if (credentialStatus === CredentialStatusEnum.REVOKED) {
      return CredentialStatusEnum.REVOKED
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

  public static isExpired(expirationDate: string | number | undefined): CredentialStatusEnum | undefined {
    let expirationDateNum = 0
    if (expirationDate) {
      if (typeof expirationDate === 'string') {
        expirationDateNum = new Date(expirationDate).valueOf() / DateUtils.EPOCH_MILLISECONDS
      } else {
        expirationDateNum = expirationDate
      }
    }

    if (expirationDate && expirationDateNum < new Date().valueOf() / 1000) {
      return CredentialStatusEnum.EXPIRED
    }
  }
}

export default CredentialUtils
