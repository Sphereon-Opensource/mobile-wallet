export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  identifiers: Array<IUserIdentifier>;
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface BasicUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  identifiers?: Array<BasicUserIdentifier>;
}

export interface IUserIdentifier {
  did: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}
export type BasicUserIdentifier = Omit<IUserIdentifier, 'createdAt' | 'lastUpdatedAt'>;
