import {IContact} from "@sphereon/ssi-sdk-data-store";

export function compareContact(contact1: IContact, contact2: IContact) {
  return contact1.alias.toLowerCase().localeCompare(contact2.alias.toLowerCase());
}
