import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {CredentialMapper, OriginalVerifiableCredential} from '@sphereon/ssi-types';
import {generateDigest} from './CryptoUtils';
import {getOriginalVerifiableCredential, isUniqueDigitalCredential} from './CredentialUtils';
import {DcqlCredential, DcqlCredentialPresentation, DcqlQuery, DcqlSdJwtVcCredential, DcqlSdJwtVcPresentation, DcqlW3cVcCredential, JsonRecord} from 'dcql';
import agent from '../agent';
import {IVerifiableCredential, JwtDecodedVerifiableCredential, SdJwtDecodedVerifiableCredential} from '@sphereon/ssi-types/src/types';
import {DcqlCredentialMatch} from '@sphereon/ssi-types/src/types/dcql';


export function convertToDcqlCredentials(credential: UniqueDigitalCredential | OriginalVerifiableCredential): DcqlCredential {
  const payload = decodePayload(credential);
  if ('vct' in payload!) {
    return {vct: payload.vct, claims: payload, credential_format: 'vc+sd-jwt'} satisfies DcqlSdJwtVcCredential; // TODO dc+sd-jwt support?
  } else if ('docType' in payload! && 'namespaces' in payload) { // mdoc
    return {docType: payload.docType, namespaces: payload.namespaces, claims: payload};
  } else {
    return {
      claims: payload,
      credential_format: 'jwt_vc_json', // TODO jwt_vc_json-ld support
    } as DcqlW3cVcCredential;
  }
}

async function createSdJwtPresentation(payload: SdJwtDecodedVerifiableCredential, match: DcqlCredentialMatch) {

  // TODO add KbJWt


  const presentationResult = await agent.createSdJwtPresentation({
    ...(idOpts?.method === 'oid4vci-issuer' && {holder: idOpts?.issuer as string}),
    presentation: payload.compactSdJwtVc,
    kb: {
      payload: {
        ...presentation.kbJwt?.payload,
        iat: presentation.kbJwt?.payload?.iat ?? Math.floor(Date.now() / 1000 - CLOCK_SKEW),
        nonce: challenge ?? presentation.kbJwt?.payload?.nonce,
        aud: presentation.kbJwt?.payload?.aud ?? domain ?? args.domain,
      },
    },
  });
  const result = {vct: payload.vct, claims: payload, credential_format: 'vc+sd-jwt'} satisfies DcqlSdJwtVcPresentation; // TODO dc+sd-jwt support?
  return result;
}

export async function createDcqlPresentations(dcqlQuery: DcqlQuery, credentials: (UniqueDigitalCredential | OriginalVerifiableCredential)[]): Promise<Record<string, DcqlCredentialPresentation>> {
  const presentations: Record<string, DcqlCredentialPresentation> = {};

  const dcqlCredentials: DcqlCredential[] = [];
  credentials.forEach((vc: UniqueDigitalCredential | OriginalVerifiableCredential) => {
    const dcqlCredential = convertToDcqlCredentials(vc);
    if (dcqlCredential) {
      dcqlCredentials.push(dcqlCredential);
    }
  });

  const queryResult = DcqlQuery.query(dcqlQuery, dcqlCredentials);

  for (const [key, value] of Object.entries(queryResult.credential_matches)) {
    const allMatches = Array.isArray(value) ? value : [value];
    for (const match of allMatches) {
      if (match.success) {
        const originalCredential = getOriginalVerifiableCredential(credentials[match.input_credential_index]);
        if (!originalCredential) {
          throw new Error(`Index ${match.input_credential_index} out of range in credentials array`);
        }
        const payload = decodePayload(originalCredential)
        const dcqlCredential = dcqlCredentials[match.input_credential_index]
        switch (dcqlCredential.credential_format) {
          case 'vc+sd-jwt':
            presentations[key] = await createSdJwtPresentation(payload as SdJwtDecodedVerifiableCredential, match)
          case 'jwt_vc_json':
            // TODO
            break;
          case 'jwt_vc_json-ld':
            // TODO
            break;
          case 'mso_mdoc':
            // TODO
            break;
        }
        return Promise.reject(Error(`createDcqlPresentations does not supper credential_format ${dcqlCredential.credential_format}`))

      }
    }
  }

  return presentations;
}

function decodePayload(credential: UniqueDigitalCredential | OriginalVerifiableCredential): JwtDecodedVerifiableCredential | IVerifiableCredential | SdJwtDecodedVerifiableCredential {
  let payload;
  if (isUniqueDigitalCredential(credential)) {
    if (!credential.originalVerifiableCredential) {
      throw new Error('originalVerifiableCredential is not defined in UniqueDigitalCredential');
    }
    payload = CredentialMapper.decodeVerifiableCredential(credential.originalVerifiableCredential, generateDigest);
  } else {
    payload = CredentialMapper.decodeVerifiableCredential(credential as OriginalVerifiableCredential, generateDigest);
  }

  if (!payload) {
    throw new Error('No payload found');
  }

  if ('decodedPayload' in payload && payload.decodedPayload) {
    payload = payload.decodedPayload;
  }
  return payload;
}
