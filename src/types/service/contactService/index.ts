import {FindContactArgs, FindIdentityArgs, IBasicIdentity, IContact} from '@sphereon/ssi-sdk-data-store';

export interface ICreateContactArgs {
  name: string;
  alias: string;
  uri?: string;
  identities?: Array<IBasicIdentity>;
}

export interface IUpdateContactArgs {
  contact: IContact;
}

export interface IAddIdentityArgs {
  contactId: string;
  identity: IBasicIdentity;
}

export interface IGetContactsArgs {
  filter?: FindContactArgs;
}

export interface IGetIdentitiesArgs {
  filter?: FindIdentityArgs;
}
