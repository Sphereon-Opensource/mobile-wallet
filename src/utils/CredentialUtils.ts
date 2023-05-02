import {CredentialMapper, ICredential, OriginalVerifiableCredential} from '@sphereon/ssi-types';

import {CredentialStatusEnum, ICredentialSummary, IUserIdentifier} from '../types';

import {IContact, IIdentity} from '@sphereon/ssi-sdk-data-store';
import store from '../store';
import {VerifiableCredential} from '@veramo/core/src/types/vc-data-model';
import {UniqueVerifiableCredential} from '@veramo/core';

/**
 * Return the type(s) of a VC minus the VerifiableCredential type which should always be present
 * @param credential The input credential
 */
export const getCredentialTypeAsString = (credential: ICredential | VerifiableCredential): string => {
  if (!credential.type) {
    return 'Verifiable Credential';
  } else if (typeof credential.type === 'string') {
    return credential.type;
  }
  return credential.type.filter(t => t !== 'VerifiableCredential').join(', ');
};

/**
 * Returns a Unique Verifiable Credential (with hash) as stored in Veramo, based upon matching the id of the input VC or the proof value of the input VC
 * @param uniqueVCs The Unique VCs to search in
 * @param searchVC The VC to search for in the unique VCs array
 */
export const getMatchingUniqueVerifiableCredential = (
  uniqueVCs: UniqueVerifiableCredential[],
  searchVC: ICredential | VerifiableCredential | string,
): UniqueVerifiableCredential | undefined => {
  // Since an ID is optional in a VC according to VCDM, and we really need the matches, we have a fallback match on something which is guaranteed to be unique for any VC (the proof(s))
  return uniqueVCs.find(
    uniqueVC =>
      (typeof searchVC !== 'string' &&
        (uniqueVC.verifiableCredential.id === searchVC.id || uniqueVC.verifiableCredential.proof === searchVC.proof)) ||
      (typeof searchVC === 'string' && uniqueVC.verifiableCredential?.proof?.jwt === searchVC),
  );
};

/**
 * Get an original verifiable credential. Maps to wrapped Verifiable Credential first, to get an original JWT as Veramo stores these with a special proof value
 * @param vc The input VC
 */
export const getOriginalVerifiableCredential = (vc: VerifiableCredential | ICredential) => {
  return CredentialMapper.toWrappedVerifiableCredential(vc as OriginalVerifiableCredential).original;
};

export const getCredentialStatus = (credential: ICredential | VerifiableCredential | ICredentialSummary, expirationDate: number): CredentialStatusEnum => {
  if (isRevoked()) {
    return CredentialStatusEnum.REVOKED;
  } else if (isExpired(expirationDate)) {
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
  return expirationDate < Date.now()/1000;
};

export const translateCorrelationIdToName = (correlationId: string): string => {
  const contacts = store.getState().contact.contacts;
  const activeUser = store.getState().user.activeUser;

  const contact = contacts.find((contact: IContact) =>
    contact.identities.some((identity: IIdentity) => identity.identifier.correlationId === correlationId),
  );
  if (contact) {
    return contact.alias;
  }

  if (activeUser && activeUser.identifiers.some((identifier: IUserIdentifier) => identifier.did === correlationId)) {
    return `${activeUser.firstName} ${activeUser.lastName}`;
  }

  return correlationId;
};
