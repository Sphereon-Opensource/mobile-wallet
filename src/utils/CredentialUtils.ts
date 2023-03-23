import {ICredential} from '@sphereon/ssi-types';

import {CredentialStatusEnum, ICredentialSummary} from '../types';

import {EPOCH_MILLISECONDS} from './DateUtils';
import {IContact, IIdentity} from '@sphereon/ssi-sdk-data-store';
import store from '../store';

export const getCredentialStatus = (credential: ICredential | ICredentialSummary): CredentialStatusEnum => {
  if (isRevoked()) {
    return CredentialStatusEnum.REVOKED;
  } else if (isExpired(credential.expirationDate)) {
    return CredentialStatusEnum.EXPIRED;
  }

  return CredentialStatusEnum.VALID;
};

/**
 * @return
 *  true means the credential is revoked.
 *  false means the credential is not revoked.
 */
export const isRevoked = (): boolean => {
  return false;
  // TODO implement
  // {
  //  id: 'https://revocation-sphereon.sphereon.io/services/credentials/wallet-dev#2022021400',
  //  type: 'RevocationList2022021401Status',
  //  revocationListIndex: '2022021402',
  //  revocationListCredential: 'https://revocation-sphereon.sphereon.io/services/credentials/wallet-dev#2022021400',
  // }
};

/**
 * @param value The number of milliseconds between 1 January 1970 00:00:00 UTC and the given date or a formatted date required by Date(...)
 * @return
 *  true means the credential is expired.
 *  false means the credential is not expired.
 */
export const isExpired = (value?: string | number): boolean => {
  if (!value) {
    return false;
  }
  const expirationDate = typeof value === 'string' ? new Date(value).valueOf() : value;

  return expirationDate < Date.now();
};

export const translateDidToName = (did: string): string => {
  console.log(`did!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!: ${did}`)

  const contacts = store.getState().contact.contacts

  console.log(`CONTACTS: ${JSON.stringify(contacts)}`)

  const contact = contacts.find((contact: IContact) => contact.identities.some((identity: IIdentity) => identity.identifier.correlationId === did))

  if (!contact) {
    return did
  }

  return contact.name
}
