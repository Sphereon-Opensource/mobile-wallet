import React, {FC, useEffect, useState} from 'react';
import {View, StatusBar, StyleSheet, Text, ActivityIndicator} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import * as Auth from 'expo-local-authentication';
import {ImageAttributes} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import {CredentialCardSheen} from '../../components/views/CredentialCardSheen';
import {MainRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, MainRoutesEnum.DC_API_CONSENT>;

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

const DCApiConsentScreen: FC<Props> = (props: Props): JSX.Element => {
  const {route} = props;
  const {credential, origin, onComplete, skipBiometric} = route.params;
  const credentialCardLogo = getCredentialCardLogo(credential);
  const [processing, setProcessing] = useState(skipBiometric ?? false);

  useEffect(() => {
    if (skipBiometric) {
      return;
    }
    let cancelled = false;
    const authenticate = async () => {
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
        if (!authenticated) {
          console.log('[DCApiConsent] Authentication failed or cancelled');
        }
      } catch (e) {
        console.log('[DCApiConsent] Biometric error, proceeding anyway:', e);
        authenticated = true;
      }
      if (!cancelled) {
        console.log('[DCApiConsent] Calling onComplete with:', authenticated);
        setProcessing(true);
        onComplete(authenticated);
      }
    };
    authenticate();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#202537" />
      {origin ? (
        <View style={styles.originContainer}>
          <Text style={styles.sharingLabel}>Sharing with</Text>
          <Text style={styles.originText}>{formatOrigin(origin)}</Text>
        </View>
      ) : null}
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
      {processing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.loadingText}>Sharing credential...</Text>
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
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginBottom: 4,
  },
  originText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
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
});

export default DCApiConsentScreen;
