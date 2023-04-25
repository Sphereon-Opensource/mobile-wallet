import {ICredential} from '@sphereon/ssi-types';

import { CredentialStatusEnum, ICredentialSummary, IUserIdentifier } from '../types'

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

export const translateCorrelationIdToName = (correlationId: string): string => {
  const contacts = store.getState().contact.contacts
  const activeUser = store.getState().user.activeUser

  const contact = contacts.find((contact: IContact) => contact.identities.some((identity: IIdentity) => identity.identifier.correlationId === correlationId))
  if (contact) {
    return contact.alias
  }

  if (activeUser && activeUser.identifiers.some((identifier: IUserIdentifier) => identifier.did === correlationId)) {
    return `${activeUser.firstName} ${activeUser.lastName}`
  }

  return correlationId
}
