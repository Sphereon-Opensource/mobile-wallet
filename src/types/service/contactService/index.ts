import {
  FindPartyArgs,
  FindIdentityArgs,
  NonPersistedIdentity,
  Party,
  NonPersistedParty,
  NonPersistedContact,
  NonPersistedPartyType as NonPersistedContactType,
} from '@sphereon/ssi-sdk.data-store';

export type ICreateContactArgs = Omit<NonPersistedParty, 'contact' | 'partyType'> &
  NonPersistedContact & {
    contactType: NonPersistedContactType;
  };

export interface IUpdateContactArgs {
  contact: Party;
}

export interface IAddIdentityArgs {
  contactId: string;
  identity: NonPersistedIdentity;
}

export interface IGetContactsArgs {
  filter?: FindPartyArgs;
}

export interface IGetIdentitiesArgs {
  filter?: FindIdentityArgs;
}
