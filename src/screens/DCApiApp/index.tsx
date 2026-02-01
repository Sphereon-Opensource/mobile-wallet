import React, {FC, useEffect, useState} from 'react';
import {View, StatusBar, StyleSheet, Text, ActivityIndicator, NativeModules} from 'react-native';
import {DocumentType, UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {ICredentialBranding, Party} from '@sphereon/ssi-sdk.data-store-types';
import {VerifiableCredential} from '@sphereon/ssi-types';
import {CredentialSummary, getCredentialStatus, getIssuerLogo, toCredentialSummary} from '@sphereon/ui-components.credential-branding';
import {ImageAttributes} from '@sphereon/ui-components.core';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import {DcqlQuery} from 'dcql';
import {convertToDcqlCredentials} from '@sphereon/ssi-sdk.siopv2-oid4vp-op-auth';
import * as Auth from 'expo-local-authentication';
import agent from '../../agent';
import {DEFAULT_DB_CONNECTION} from '../../services/databaseService';
import {siopRegisterSession} from '../../providers/authentication/SIOPv2Provider';
import {sendResponse} from '../../services/machines/siopV2MachineService';
import {matchesDCApiId} from '../../services/dcApiCredentialSync';
import {getCredentialIssuerContact, getCredentialSubjectContact} from '../../utils/CredentialUtils';
import {CredentialCardSheen} from '../../components/views/CredentialCardSheen';

const TAG = '[DCApiApp]';

interface DCApiAppProps {
  requestJson: string;
  origin: string;
  packageName: string;
  selectedCredentialId: string;
}

interface OID4VPRequestData {
  dcql_query: Record<string, unknown>;
  nonce?: string;
  client_id?: string;
  response_type?: string;
  response_mode?: string;
  response_uri?: string;
  redirect_uri?: string;
}

function extractOID4VPData(requestJson: string): {data: OID4VPRequestData; protocol: string} | undefined {
  try {
    const parsed = JSON.parse(requestJson);

    if (parsed.requests && Array.isArray(parsed.requests)) {
      for (const req of parsed.requests) {
        if (req.protocol?.startsWith('openid4vp')) {
          const data = typeof req.data === 'string' ? JSON.parse(req.data) : req.data;
          return {data, protocol: req.protocol};
        }
      }
    }

    if (parsed.providers && Array.isArray(parsed.providers)) {
      for (const prov of parsed.providers) {
        if (prov.protocol?.startsWith('openid4vp')) {
          const data = typeof prov.request === 'string' ? JSON.parse(prov.request) : prov.request;
          return {data, protocol: prov.protocol};
        }
      }
    }

    if (parsed.dcql_query) {
      return {data: parsed, protocol: 'openid4vp'};
    }
  } catch (e) {
    console.error(TAG, 'Failed to parse request JSON:', e);
  }
  return undefined;
}

const getCredentialCardLogo = (credential: CredentialSummary): ImageAttributes | undefined => {
  if (credential.branding?.logo?.uri || credential.branding?.logo?.dataUri) {
    return credential.branding.logo;
  }
  const uri: string | undefined = getIssuerLogo(credential, credential.branding);
  if (uri) {
    return {uri};
  }
};

const formatOrigin = (origin: string): string => {
  return origin.replace(/^https?:\/\//, '');
};

const DCApiApp: FC<DCApiAppProps> = (props) => {
  const {requestJson, origin, selectedCredentialId} = props;
  const [credential, setCredential] = useState<CredentialSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'authenticating' | 'processing' | 'done' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // 0. Ensure DB is initialized (migrations complete) before querying
        await DEFAULT_DB_CONNECTION;

        // 1. Extract OID4VP data
        const extracted = extractOID4VPData(requestJson);
        if (!extracted) {
          throw new Error('Invalid request format');
        }
        const {data: oid4vpData} = extracted;

        // 2. Find matching credentials
        const allCredentials: UniqueDigitalCredential[] = await agent.crsGetUniqueCredentials({
          filter: [{documentType: DocumentType.VC}],
        });
        const holderCredentials = allCredentials.filter(
          (cred) => cred.digitalCredential.credentialRole.toLowerCase() === 'holder' && !cred.digitalCredential.parentId,
        );

        let selectedCredentials = holderCredentials;
        if (selectedCredentialId) {
          const matched = holderCredentials.filter((cred) => matchesDCApiId(cred.hash, selectedCredentialId));
          if (matched.length > 0) {
            selectedCredentials = matched;
          }
        }

        if (selectedCredentials.length > 1 && oid4vpData.dcql_query) {
          try {
            const dcqlQuery = DcqlQuery.parse(oid4vpData.dcql_query);
            const dcqlCreds = selectedCredentials.map((vc) => convertToDcqlCredentials(vc));
            const queryResult = DcqlQuery.query(dcqlQuery, dcqlCreds);
            if (queryResult.can_be_satisfied) {
              const matchedIndexes = new Set<number>();
              for (const value of Object.values(queryResult.credential_matches)) {
                if (value.success && value.valid_credentials) {
                  for (const cred of value.valid_credentials) {
                    matchedIndexes.add(cred.input_credential_index);
                  }
                }
              }
              if (matchedIndexes.size > 0) {
                selectedCredentials = Array.from(matchedIndexes).map((i) => selectedCredentials[i]);
              }
            }
          } catch (e) {
            console.warn(TAG, 'DCQL matching failed:', e);
          }
        }

        if (selectedCredentials.length === 0) {
          throw new Error('No matching credentials');
        }

        // 3. Build credential summary
        const credentialsBranding: Array<ICredentialBranding> = await agent.ibGetCredentialBranding({
          filter: [{vcHash: selectedCredentials[0].hash}],
        });
        const uniform = JSON.parse(selectedCredentials[0].digitalCredential.uniformDocument) as VerifiableCredential;
        const issuer: Party | undefined = getCredentialIssuerContact(uniform);
        const summary = await toCredentialSummary({
          verifiableCredential: uniform,
          hash: selectedCredentials[0].hash,
          credentialRole: selectedCredentials[0].digitalCredential.credentialRole,
          branding: credentialsBranding[0]?.localeBranding,
          issuer,
          subject: getCredentialSubjectContact(uniform),
        });

        if (cancelled) return;
        setCredential(summary);
        setStatus('authenticating');

        // 4. Biometric
        let authenticated = false;
        try {
          const result = await Auth.authenticateAsync({
            promptMessage: 'Share credential',
            cancelLabel: 'Cancel',
            disableDeviceFallback: true,
            fallbackLabel: 'Try again later',
            biometricsSecurityLevel: 'strong',
          });
          authenticated = result.success;
        } catch (e) {
          console.log(TAG, 'Biometric error, proceeding:', e);
          authenticated = true;
        }

        if (cancelled) return;

        if (!authenticated) {
          console.log(TAG, 'User cancelled');
          NativeModules.DCApiModule?.sendError('User cancelled');
          setStatus('done');
          return;
        }

        setStatus('processing');

        // 5. Build VP
        if (!oid4vpData.response_uri && !oid4vpData.redirect_uri) {
          (oid4vpData as any).response_uri = `https://${(origin || 'dc-api').replace(/^https?:\/\//, '')}/dc-api-response`;
        }
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(oid4vpData)) {
          params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        const requestUri = `openid4vp://authorize?${params.toString()}`;

        const sessionId = `dcapi-${Date.now()}`;
        await siopRegisterSession({requestJwtOrUri: requestUri, sessionId});

        await sendResponse({
          didAuthConfig: {
            sessionId,
            redirectUrl: requestUri,
            stateId: sessionId,
            identifier: {did: '', provider: '', keys: [], services: []},
          },
          authorizationRequestData: {
            correlationId: origin || 'dc-api',
            uri: origin ? new URL(`https://${origin.replace(/^https?:\/\//, '')}`) : undefined,
          } as any,
          selectedCredentials,
          contact: undefined,
          dcApiMode: true,
          dcApiOrigin: origin,
        });

        if (cancelled) return;
        console.log(TAG, 'DC API response sent successfully');
        setStatus('done');
      } catch (e: any) {
        if (cancelled) return;
        console.error(TAG, 'Error:', e?.message || e);
        setErrorMessage(e?.message || 'Failed to create presentation');
        NativeModules.DCApiModule?.sendError(e?.message || 'Failed to create presentation');
        setStatus('error');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const credentialCardLogo = credential ? getCredentialCardLogo(credential) : undefined;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#202537" />
      {origin ? (
        <View style={styles.originContainer}>
          <Text style={styles.sharingLabel}>Sharing with</Text>
          <Text style={styles.originText}>{formatOrigin(origin)}</Text>
        </View>
      ) : null}
      {credential && (
        <View style={styles.cardWrapper}>
          <CredentialCardSheen>
            <SSICredentialCardView
              header={{
                credentialTitle: credential.branding?.alias ?? credential.title,
                credentialSubtitle: credential.branding?.description,
                logo: credentialCardLogo,
              }}
              body={{
                issuerName: credential.issuer?.alias ?? credential.issuer?.name,
              }}
              footer={{
                credentialStatus: getCredentialStatus(credential),
                expirationDate: credential.expirationDate,
              }}
              display={{
                backgroundColor: credential.branding?.background?.color,
                backgroundImage: credential.branding?.background?.image,
                textColor: credential.branding?.text?.color,
              }}
            />
          </CredentialCardSheen>
        </View>
      )}
      {(status === 'loading' || status === 'authenticating') && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.loadingText}>{status === 'loading' ? 'Loading credential...' : 'Waiting for authentication...'}</Text>
        </View>
      )}
      {status === 'processing' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.loadingText}>Sharing credential...</Text>
        </View>
      )}
      {status === 'error' && (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{errorMessage || 'Something went wrong'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202537',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  originContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sharingLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    marginBottom: 6,
  },
  originText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  errorText: {
    color: 'rgba(255, 100, 100, 0.8)',
    fontSize: 14,
  },
});

export default DCApiApp;
