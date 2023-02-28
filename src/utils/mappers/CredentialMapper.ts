import { ICredential } from '@sphereon/ssi-types'

import { ICredentialDetailsRow, ICredentialSummary } from '../../types'
import { getCredentialStatus, translateDid, translateDidToName } from '../CredentialUtils'
import { EPOCH_MILLISECONDS } from '../DateUtils'

const { v4: uuidv4 } = require('uuid')

function toCredentialDetailsRow(object: Record<string, any>): ICredentialDetailsRow[] {
  let rows: ICredentialDetailsRow[] = []
  // eslint-disable-next-line prefer-const
  for (let [key, value] of Object.entries(object)) {
    // TODO fix hacking together the image
    if (key.toLowerCase().includes('image')) {
      rows.push({
        id: uuidv4(),
        label: 'image',
        value: typeof value === 'string' ? value : value.id
      })
      continue
    } else if (key === 'type') {
      rows.push({
        id: uuidv4(),
        label: key,
        value: value
      })
      continue
    }

    if (typeof value !== 'string') {
      rows.push({
        id: uuidv4(),
        label: key,
        value: undefined
      })
      rows = rows.concat(toCredentialDetailsRow(value))
    } else {
      console.log(`==>${key}:${value}`)
      let label = key === '0' ? `${value}` : key
      if (key === 'id' && value.startsWith('did:')) {
        label = 'subject'
      }

      if (value.startsWith('did:')) {
        console.log(`did: ${value}`)
        value = translateDidToName(value)
      }

      rows.push({
        id: uuidv4(),
        label, // TODO Human readable mapping
        value: key === '0' ? undefined : value
      })
    }
  }

  return rows
}

export function toCredentialSummary(verifiableCredential: ICredential, hash?: string): ICredentialSummary {
  const expirationDate = verifiableCredential.expirationDate
    ? new Date(verifiableCredential.expirationDate).valueOf() / EPOCH_MILLISECONDS
    : 0
  const issueDate = new Date(verifiableCredential.issuanceDate).valueOf() / EPOCH_MILLISECONDS

  const credentialStatus = getCredentialStatus(verifiableCredential)

  const title = verifiableCredential.name
    ? verifiableCredential.name
    : !verifiableCredential.type
    ? 'unknown'
    : typeof verifiableCredential.type === 'string'
    ? verifiableCredential.type
    : verifiableCredential.type.filter((value) => value !== 'VerifiableCredential')[0]
  const signedBy =
    typeof verifiableCredential.issuer === 'string'
      ? verifiableCredential.issuer
      : verifiableCredential.issuer?.name
      ? verifiableCredential.issuer?.name
      : verifiableCredential.issuer?.id

  console.log(`Signed by: ${signedBy}`)
  console.log(`Credential Subject: ${verifiableCredential.credentialSubject}`)
  const properties = toCredentialDetailsRow(verifiableCredential.credentialSubject)

  const name =
    typeof verifiableCredential.issuer === 'string'
      ? translateDidToName(verifiableCredential.issuer)
      : verifiableCredential.issuer?.name
      ? verifiableCredential.issuer?.name
      : verifiableCredential.issuer?.id
  return {
    id: hash ? hash : verifiableCredential.id ? verifiableCredential.id : 'todo',
    title,
    issuer: {
      name: name.length > 50 ? `${name.substring(0, 50)}...` : name,

      image: typeof verifiableCredential.issuer !== 'string' ? verifiableCredential.issuer.image : undefined,
      url: typeof verifiableCredential.issuer !== 'string' ? verifiableCredential.issuer.url : undefined
    },
    credentialStatus,
    issueDate,
    expirationDate,
    properties,
    signedBy
  }
}
