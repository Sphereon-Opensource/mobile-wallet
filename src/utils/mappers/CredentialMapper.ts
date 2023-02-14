import { ICredential } from '@sphereon/ssi-types'

import { ICredentialDetailsRow, ICredentialSummary } from '../../@types'
import { getCredentialStatus } from '../CredentialUtils'

const { v4: uuidv4 } = require('uuid')

function toCredentialDetailsRow(object: Record<string, any>): ICredentialDetailsRow[] {
  let rows: ICredentialDetailsRow[] = []
  // console.log(`OBJECT: ${JSON.stringify(object, null, 2)}`)
  for (const [key, value] of Object.entries(object)) {
    // TODO fix hacking together the image
    if (key.toLowerCase().includes('image')) {
      // console.log(`IMAGE!!!!!${key}:${value}`)
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
      // console.log(`NON STRING:${key}`)
      rows = rows.concat(toCredentialDetailsRow(value))
    } else {
      console.log(`==>${key}:${value}`)
      let label = key === '0' ? `${value}` : key
      if (key === 'id' && value.startsWith('did:')) {
        label = 'subject'
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
    ? new Date(verifiableCredential.expirationDate).valueOf() / 1000
    : 0
  const issueDate = new Date(verifiableCredential.issuanceDate).valueOf() / 1000

  const credentialStatus = getCredentialStatus(verifiableCredential)
  //TODO add revoked status support

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
      ? verifiableCredential.issuer
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
