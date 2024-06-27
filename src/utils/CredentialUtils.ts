import {Party, Identity} from '@sphereon/ssi-sdk.data-store';
import {CredentialMapper, ICredential, OriginalVerifiableCredential, IVerifiableCredential} from '@sphereon/ssi-types';
import {UniqueVerifiableCredential, VerifiableCredential} from '@veramo/core';
import {CredentialStatus} from '@sphereon/ui-components.core';
import store from '../store';
import {ICredentialSummary, IUser, IUserIdentifier} from '../types';
import {makeEpochMilli} from './DateUtils';

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
  return credential.type.filter((type: string): boolean => type !== 'VerifiableCredential').join(', ');
};

/**
 * Returns a Unique Verifiable Credential (with hash) as stored in Veramo, based upon matching the id of the input VC or the proof value of the input VC
 * @param uniqueVCs The Unique VCs to search in
 * @param searchVC The VC to search for in the unique VCs array
 */
export const getMatchingUniqueVerifiableCredential = (
  uniqueVCs: UniqueVerifiableCredential[],
  searchVC: OriginalVerifiableCredential,
): UniqueVerifiableCredential | undefined => {
  // Since an ID is optional in a VC according to VCDM, and we really need the matches, we have a fallback match on something which is guaranteed to be unique for any VC (the proof(s))
  return uniqueVCs.find(
    (uniqueVC: UniqueVerifiableCredential) =>
      (typeof searchVC !== 'string' &&
        (uniqueVC.verifiableCredential.id === (<IVerifiableCredential>searchVC).id ||
          uniqueVC.verifiableCredential.proof === (<IVerifiableCredential>searchVC).proof)) ||
      (typeof searchVC === 'string' && uniqueVC.verifiableCredential?.proof?.jwt === searchVC) ||
      // We are ignoring the signature of the sd-jwt as PEX signs the vc again and it will not match anymore with the jwt in the proof of the stored jsonld vc
      (typeof searchVC === 'string' &&
        CredentialMapper.isSdJwtEncoded(searchVC) &&
        uniqueVC.verifiableCredential?.proof?.jwt.split('.').slice(0, 2).join('.') === searchVC.split('.').slice(0, 2).join('.')),
  );
};

/**
 * Get an original verifiable credential. Maps to wrapped Verifiable Credential first, to get an original JWT as Veramo stores these with a special proof value
 * @param vc The input VC
 */
export const getOriginalVerifiableCredential = (vc: VerifiableCredential | ICredential) => {
  // FIXME we need to start using one singular flow instead of making these sd-jwt checks. the difficulty is that we have multiple representations of a sd-jwt (sd-jwt and jsonld) and we do not need to decode the sd-jwt here for example. we just need the original which was a string
  // TODO can we not call CredentialMapper.storedCredentialToOriginalFormat instead of using this function?
  return CredentialMapper.isSdJwtEncoded(vc.proof.jwt)
    ? vc.proof.jwt
    : CredentialMapper.toWrappedVerifiableCredential(vc as OriginalVerifiableCredential).original;
};

export const getCredentialStatus = (credential: ICredential | VerifiableCredential | ICredentialSummary): CredentialStatus => {
  if (isRevoked()) {
    return CredentialStatus.REVOKED;
  } else if (isExpired(credential.expirationDate)) {
    return CredentialStatus.EXPIRED;
  }

  return CredentialStatus.VALID;
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
  let expirationDate: number = typeof value === 'string' ? new Date(value).valueOf() : value;
  expirationDate = makeEpochMilli(expirationDate);
  return expirationDate < Date.now();
};

export const translateCorrelationIdToName = (correlationId: string): string => {
  const contacts: Array<Party> = store.getState().contact.contacts;
  const activeUser: IUser | undefined = store.getState().user.activeUser;

  const contact: Party | undefined = contacts.find((contact: Party) =>
    contact.identities.some((identity: Identity): boolean => identity.identifier.correlationId === correlationId),
  );
  if (contact) {
    return contact.contact.displayName;
  }

  if (activeUser && activeUser.identifiers.some((identifier: IUserIdentifier): boolean => identifier.did === correlationId)) {
    return `${activeUser.firstName} ${activeUser.lastName}`;
  }

  return correlationId;
};
