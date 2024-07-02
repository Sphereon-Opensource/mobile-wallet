import {Identity} from '@sphereon/ssi-sdk.data-store';
import {Party} from '../types/store/contact.types';
import {CredentialMapper, ICredential, OriginalVerifiableCredential, IVerifiableCredential} from '@sphereon/ssi-types';
import {UniqueVerifiableCredential, VerifiableCredential} from '@veramo/core';
import store from '../store';
import {IUser, IUserIdentifier} from '../types';

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

export const getCredentialIssuerContact = (vc: VerifiableCredential | ICredential): Party | undefined => {
  const contacts: Array<Party> = store.getState().contact.contacts;
  const issuer: string = typeof vc.issuer === 'string' ? vc.issuer : vc.issuer?.id ?? vc.issuer?.name;
  return contacts.find((contact: Party) => contact.identities.some((identity: Identity): boolean => identity.identifier.correlationId === issuer));
};
