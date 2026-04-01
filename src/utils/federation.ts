import {NonPersistedParty, Party} from '@sphereon/ssi-sdk.data-store-types';
import agent from '../agent';

export async function lookupFederationParties(contact: NonPersistedParty | Party, trustedAnchors?: Array<string>) {
  if (contact.uri?.endsWith('eduid.nl') && !trustedAnchors?.includes('https://issuer.dev.eduid.nl/eduid')) {
    if (!trustedAnchors) {
      trustedAnchors = [];
    }

    trustedAnchors?.push('https://issuer.dev.eduid.nl/eduid');
  } else if (contact.uri?.endsWith('.sphereon.com') && !trustedAnchors?.includes('https://federation.demo.sphereon.com')) {
    if (!trustedAnchors) {
      trustedAnchors = [];
    }

    trustedAnchors?.push('https://federation.demo.sphereon.com');
  }

  const getContactsArgs = {
    filter: trustedAnchors?.map(trustedAnchor => ({identities: {identifier: {correlationId: trustedAnchor}}})),
  };
  return Array.isArray(trustedAnchors) && trustedAnchors.length > 0 ? await agent.cmGetContacts(getContactsArgs) : [];
}
