import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {ICredential, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {UniqueVerifiableCredential, VerifiableCredential} from '@veramo/core';
import {computeEntryHash} from '@veramo/utils';
import {CredentialStatus} from '@sphereon/ui-components.core';
import {selectAppLocaleBranding} from '../../../services/brandingService';
import {ICredentialDetailsRow, ICredentialSummary} from '../../../types';
import {getCredentialStatus, translateCorrelationIdToName} from '../../CredentialUtils';
import {EPOCH_MILLISECONDS} from '../../DateUtils';
import {getImageSize, isImage} from '../../ImageUtils';

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
 * @param branding The branding for the credential
 */
export const toNonPersistedCredentialSummary = (
  verifiableCredential: ICredential | VerifiableCredential,
  branding?: Array<IBasicCredentialLocaleBranding>,
): Promise<ICredentialSummary> => {
  return toCredentialSummary(
    {
      verifiableCredential: verifiableCredential as VerifiableCredential,
      hash: verifiableCredential.id ?? computeEntryHash(verifiableCredential as VerifiableCredential),
    },
    branding,
  );
};

/**
 * Map persisted (Unique) VCs to the summaries we display
 * @param hash The hash of the unique verifiable credential
 * @param verifiableCredential The VC itself
 * @param branding The branding for the credential
 */
export const toCredentialSummary = async (
  {hash, verifiableCredential}: UniqueVerifiableCredential,
  branding?: Array<IBasicCredentialLocaleBranding>,
): Promise<ICredentialSummary> => {
  const expirationDate: number = verifiableCredential.expirationDate
    ? new Date(verifiableCredential.expirationDate).valueOf() / EPOCH_MILLISECONDS
    : 0;
  const issueDate: number = new Date(verifiableCredential.issuanceDate).valueOf() / EPOCH_MILLISECONDS;

  const credentialStatus: CredentialStatus = getCredentialStatus(verifiableCredential);

  const title = verifiableCredential.name
    ? verifiableCredential.name
    : !verifiableCredential.type
    ? 'unknown'
    : typeof verifiableCredential.type === 'string'
    ? verifiableCredential.type
    : verifiableCredential.type.filter((value: string): boolean => value !== 'VerifiableCredential')[0];
  console.log(`Credential Subject: ${JSON.stringify(verifiableCredential.credentialSubject)}`);
  const properties: Array<ICredentialDetailsRow> = await toCredentialDetailsRow(verifiableCredential.credentialSubject);

  const localeBranding: IBasicCredentialLocaleBranding | undefined = await selectAppLocaleBranding({localeBranding: branding});
  const logo = getIssuerLogo(verifiableCredential, localeBranding);
  const url = typeof verifiableCredential.issuer !== 'string' ? verifiableCredential.issuer.url : undefined;

  const name: string =
    typeof verifiableCredential.issuer === 'string'
      ? verifiableCredential.issuer
      : verifiableCredential.issuer?.name ?? verifiableCredential.issuer?.id;

  const issuerAlias: string =
    typeof verifiableCredential.issuer === 'string'
      ? translateCorrelationIdToName(verifiableCredential.issuer)
      : translateCorrelationIdToName(verifiableCredential.issuer?.id);

  return {
    hash,
    id: verifiableCredential.id,
    title: localeBranding?.alias || title,
    credentialStatus,
    issueDate,
    expirationDate,
    properties,
    branding: localeBranding,
    issuer: {
      name,
      alias: issuerAlias.length > 50 ? `${issuerAlias.substring(0, 50)}...` : issuerAlias,
      image: logo,
      url,
    },
  };
};

export function getIssuerLogo(verifiableCredential: VerifiableCredential | ICredentialSummary, localeBranding?: IBasicCredentialLocaleBranding) {
  let logo: string | undefined;

  if (localeBranding?.logo) {
    logo = localeBranding.logo.dataUri ?? localeBranding.logo.uri;
  }
  if (!logo && typeof verifiableCredential.issuer === 'object') {
    if ('logo' in verifiableCredential.issuer && verifiableCredential.issuer.logo) {
      logo = getImageFromObjectOrString(verifiableCredential.issuer.logo);
    } else if (verifiableCredential.issuer.image) {
      logo = getImageFromObjectOrString(verifiableCredential.issuer.image);
    }
  }
  return logo;
}

export function getImageFromObjectOrString(image?: string | object): string | undefined {
  if (!image) {
    return undefined;
  } else if (typeof image === 'string' && image.length > 0) {
    return image;
  } else if (typeof image === 'object') {
    if ('id' in image && typeof image.id === 'string' && image.id.includes('://')) {
      return image.id;
    } else if ('url' in image && typeof image.url === 'string' && image.url.includes('://')) {
      return image.url;
    } else if ('uri' in image && typeof image.uri === 'string' && image.uri.includes('://')) {
      return image.uri;
    }
  }
  return undefined;
}
