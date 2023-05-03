import {ICredential} from '@sphereon/ssi-types';
import {UniqueVerifiableCredential, VerifiableCredential} from '@veramo/core';
import {computeEntryHash} from '@veramo/utils';

import {ICredentialDetailsRow, ICredentialSummary} from '../../types';
import {getCredentialStatus, translateCorrelationIdToName} from '../CredentialUtils';
import {EPOCH_MILLISECONDS} from '../DateUtils';
import {getImageSize, isImage} from '../ImageUtils';

const {v4: uuidv4} = require('uuid');

const toCredentialDetailsRow = async (object: Record<string, any>): Promise<ICredentialDetailsRow[]> => {
  let rows: ICredentialDetailsRow[] = [];
  // eslint-disable-next-line prefer-const
  for (let [key, value] of Object.entries(object)) {
    // TODO fix hacking together the image
    if (key.toLowerCase().includes('image')) {
      const image = typeof value === 'string' ? value : value.id;
      rows.push({
        id: uuidv4(),
        label: 'image',
        value: image,
        imageSize: (await isImage(image)) ? await getImageSize(image) : undefined,
      });
      continue;
    } else if (key === 'type') {
      rows.push({
        id: uuidv4(),
        label: key,
        value: value,
      });
      continue;
    }

    if (typeof value !== 'string') {
      // FIXME disabled this to not show keys of objects
      // rows.push({
      //   id: uuidv4(),
      //   label: key,
      //   value: undefined,
      // });
      rows = rows.concat(await toCredentialDetailsRow(value));
    } else {
      console.log(`==>${key}:${value}`);
      if (key === '0' || value === undefined) {
        continue;
      }

      let label = key;
      if (key === 'id' && value.startsWith('did:')) {
        label = 'subject';
      }

      if (value.startsWith('did:')) {
        console.log(`did: ${value}`);
        value = translateCorrelationIdToName(value);
      }

      rows.push({
        id: uuidv4(),
        label, // TODO Human readable mapping
        value,
        imageSize: (await isImage(value)) ? await getImageSize(value) : undefined,
      });
    }
  }

  return rows;
};

/**
 * To be used whenever we need to show a credential summary on VCs we have not persisted
 * @param verifiableCredential
 */
export const toNonPersistedCredentialSummary = (verifiableCredential: ICredential | VerifiableCredential): Promise<ICredentialSummary> => {
  return toCredentialSummary({
    verifiableCredential: verifiableCredential as VerifiableCredential,
    hash: verifiableCredential.id ?? computeEntryHash(verifiableCredential as VerifiableCredential),
  });
};

/**
 * Map persisted (Unique) VCs to the summaries we display
 * @param hash The hash of the unique verifiable credential
 * @param verifiableCredential The VC itself
 */
export const toCredentialSummary = async ({hash, verifiableCredential}: UniqueVerifiableCredential): Promise<ICredentialSummary> => {
  console.log(`CREDENTIAL: ${JSON.stringify(verifiableCredential)}`);

  const expirationDate = verifiableCredential.expirationDate ? new Date(verifiableCredential.expirationDate).valueOf() / EPOCH_MILLISECONDS : 0;
  const issueDate = new Date(verifiableCredential.issuanceDate).valueOf() / EPOCH_MILLISECONDS;

  const credentialStatus = getCredentialStatus(verifiableCredential);

  const title = verifiableCredential.name
    ? verifiableCredential.name
    : !verifiableCredential.type
    ? 'unknown'
    : typeof verifiableCredential.type === 'string'
    ? verifiableCredential.type
    : verifiableCredential.type.filter((value: string) => value !== 'VerifiableCredential')[0];
  console.log(`Credential Subject: ${verifiableCredential.credentialSubject}`);
  const properties = await toCredentialDetailsRow(verifiableCredential.credentialSubject);

  const name =
    typeof verifiableCredential.issuer === 'string'
      ? verifiableCredential.issuer
      : verifiableCredential.issuer?.name
      ? verifiableCredential.issuer?.name
      : verifiableCredential.issuer?.id;

  const issuerAlias =
    typeof verifiableCredential.issuer === 'string'
      ? translateCorrelationIdToName(verifiableCredential.issuer)
      : translateCorrelationIdToName(verifiableCredential.issuer?.id);

  return {
    hash,
    id: verifiableCredential.id,
    title,
    issuer: {
      name,
      alias: issuerAlias.length > 50 ? `${issuerAlias.substring(0, 50)}...` : issuerAlias,
      image: typeof verifiableCredential.issuer !== 'string' ? verifiableCredential.issuer.image : undefined,
      url: typeof verifiableCredential.issuer !== 'string' ? verifiableCredential.issuer.url : undefined,
    },
    credentialStatus,
    issueDate,
    expirationDate,
    properties,
  };
};
