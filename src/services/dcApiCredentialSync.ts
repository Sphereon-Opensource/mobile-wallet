import {Platform} from 'react-native';
import {DocumentType, UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {CredentialMapper, Loggers} from '@sphereon/ssi-types';
import agent from '../agent';
import {registerDCApiCredentials} from './dcApiService';

const logger = Loggers.DEFAULT.get('sphereon:dcApiCredentialSync');

/** Android Credential Manager limits entry IDs to <64 chars. We truncate the credential hash. */
export const DC_API_ID_MAX_LENGTH = 63;
export const toDCApiId = (hash: string): string => hash.substring(0, DC_API_ID_MAX_LENGTH);
export const matchesDCApiId = (fullHash: string, dcApiId: string): boolean => fullHash.startsWith(dcApiId);

interface CredentialRegistryEntry {
  id: string;
  title: string;
  subtitle: string;
  paths: string[];
}

interface CredentialRegistryPayload {
  'dc+sd-jwt': Record<string, CredentialRegistryEntry[]>;
  mso_mdoc: Record<string, CredentialRegistryEntry[]>;
}

/**
 * Builds credential metadata JSON and registers it with Android Credential Manager.
 * Call this on app startup, after credential issuance, and after credential deletion.
 */
export const syncDCApiCredentials = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    console.log('[DC API Sync] Starting credential sync...');
    const credentials: UniqueDigitalCredential[] = await agent.crsGetUniqueCredentials({
      filter: [{documentType: DocumentType.VC}],
    });
    console.log(`[DC API Sync] Found ${credentials.length} total credentials`);
    for (const cred of credentials) {
      console.log(`[DC API Sync] Credential: role=${cred.digitalCredential.credentialRole}, format=${cred.digitalCredential.documentFormat}, parentId=${cred.digitalCredential.parentId}, hash=${cred.hash?.substring(0, 20)}`);
    }

    const holderCredentials = credentials.filter(
      (cred) => cred.digitalCredential.credentialRole.toLowerCase() === 'holder' && (cred.digitalCredential.parentId === null || cred.digitalCredential.parentId === undefined),
    );
    console.log(`[DC API Sync] Found ${holderCredentials.length} holder credentials`);

    if (holderCredentials.length === 0) {
      console.log('[DC API Sync] No holder credentials to register');
      logger.debug('No holder credentials to register with DC API');
      return;
    }

    const payload = buildRegistryPayload(holderCredentials);
    const payloadJson = JSON.stringify(payload);
    console.log(`[DC API Sync] Registry payload (${payloadJson.length} chars):`);
    console.log(payloadJson);
    logger.debug(`DC API registry payload (${payloadJson.length} chars): ${payloadJson.substring(0, 500)}${payloadJson.length > 500 ? '...' : ''}`);

    await registerDCApiCredentials(payloadJson);
    console.log(`[DC API Sync] Successfully registered ${holderCredentials.length} credentials with DC API`);
    logger.info(`Registered ${holderCredentials.length} credentials with DC API`);
  } catch (e) {
    console.error('[DC API Sync] Failed to sync credentials:', e);
    logger.error('Failed to sync credentials with DC API', e);
  }
};

function buildRegistryPayload(credentials: UniqueDigitalCredential[]): CredentialRegistryPayload {
  const payload: CredentialRegistryPayload = {
    'dc+sd-jwt': {},
    mso_mdoc: {},
  };

  for (const cred of credentials) {
    const dc = cred.digitalCredential;
    const format = dc.documentFormat;
    const id = cred.hash;

    let title = 'Credential';
    let subtitle = '';
    let docType = '';
    const paths: string[] = [];

    try {
      if (cred.uniformVerifiableCredential) {
        const uniform = cred.uniformVerifiableCredential;
        if (CredentialMapper.isSdJwtDecodedCredential(uniform)) {
          docType = (uniform.decodedPayload as Record<string, unknown>).vct as string ?? 'unknown';
          title = docType.split('/').pop() ?? 'SD-JWT Credential';
          subtitle = (uniform.decodedPayload as Record<string, unknown>).iss as string ?? '';
          const disclosedPayload = uniform.decodedPayload as Record<string, unknown>;
          for (const key of Object.keys(disclosedPayload)) {
            if (!['iss', 'iat', 'exp', 'nbf', 'cnf', 'vct', '_sd', '_sd_alg'].includes(key)) {
              paths.push(key);
            }
          }
        } else {
          const types = Array.isArray(uniform.type) ? uniform.type : [uniform.type];
          docType = types.find((t: string) => t !== 'VerifiableCredential') ?? types[0] ?? 'unknown';
          title = docType;
          const issuerValue = uniform.issuer;
          subtitle = typeof issuerValue === 'string' ? issuerValue : (issuerValue as Record<string, unknown>)?.id as string ?? '';
          const subject = Array.isArray(uniform.credentialSubject) ? uniform.credentialSubject[0] : uniform.credentialSubject;
          if (subject && typeof subject === 'object') {
            for (const key of Object.keys(subject)) {
              if (key !== 'id') {
                paths.push(key);
              }
            }
          }
        }
      }
    } catch (e) {
      logger.debug(`Failed to parse credential metadata for ${id}`, e);
    }

    const entry: CredentialRegistryEntry = {
      id: toDCApiId(id),
      title,
      subtitle,
      paths,
    };

    if (format === 'vc+sd-jwt' || format === 'SD_JWT' || format === 'jwt_vc' || format === 'ldp_vc') {
      if (!payload['dc+sd-jwt'][docType]) {
        payload['dc+sd-jwt'][docType] = [];
      }
      payload['dc+sd-jwt'][docType].push(entry);
    } else if (format === 'mso_mdoc') {
      if (!payload.mso_mdoc[docType]) {
        payload.mso_mdoc[docType] = [];
      }
      payload.mso_mdoc[docType].push(entry);
    } else {
      if (!payload['dc+sd-jwt'][docType]) {
        payload['dc+sd-jwt'][docType] = [];
      }
      payload['dc+sd-jwt'][docType].push(entry);
    }
  }

  return payload;
}
