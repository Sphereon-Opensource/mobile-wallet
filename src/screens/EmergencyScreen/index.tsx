import React, {FC, useEffect, useState} from 'react';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors, buttonColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {translate} from '../../localization/Localization';
import {EMERGENCY_ALERT_DELAY} from '../../@config/constants';
import {
  EmergencyScreenButtonContainerStyled as ButtonContainer,
  EmergencyScreenContainerStyled as Container,
  EmergencyScreenCountdownInnerContainerStyled as CountdownInnerContainer,
  EmergencyScreenCountdownMiddleContainerStyled as CountdownMiddleContainer,
  EmergencyScreenCountdownOuterContainerStyled as CountdownOuterContainer,
  EmergencyScreenCountdownTextStyled as CountdownText,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {Agent, DEC112Specifics, SimpleLocation, VCard} from 'ng112-js/dist/node';
import {Alert} from 'react-native';
import * as Location from 'expo-location';
import {LocationAccuracy, LocationObject} from 'expo-location';
import {LocationMethod} from 'pidf-lo';
import {getVerifiableCredentialsFromStorage} from '../../services/credentialService';
import {UniqueVerifiableCredential} from '@veramo/core';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.EMERGENCY>;

const EmergencyScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const [sipCredentials, setSipCredentials] = useState();
  const [idAustriaData, setIdAustriaData] = useState<any>();
  const [displayName, setDisplayName] = useState('');
  const [countdown, setCountdown] = useState<number>(EMERGENCY_ALERT_DELAY);
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  let agent: Agent | null = null;
  let interval: any = null;

  // FIXME WAL-681 remove work around https://github.com/react-navigation/react-navigation/issues/11139
  void changeNavigationBarColor(backgroundColors.orange);

  useEffect(() => {
    getVerifiableCredentialsFromStorage().then(async (credentials: Array<UniqueVerifiableCredential>): Promise<void> => {
      const dec112Credential = credentials.find(c => c.verifiableCredential.type && c.verifiableCredential.type.indexOf('DEC112Credential') > -1);
      if (dec112Credential) {
        const idAustria = dec112Credential.verifiableCredential.credentialSubject['id_austria'];
        setIdAustriaData(idAustria);
        const sipData = dec112Credential.verifiableCredential.credentialSubject['sip'];
        const sipDataCredentials = sipData['sip_credentials'];
        setSipCredentials(sipDataCredentials);
        setDisplayName(`${idAustria['vorname'] ?? ''} ${idAustria['nachname'] ?? ''}`);
      }
    });
    Location.requestForegroundPermissionsAsync().then(status => {
      if (status.status !== 'granted') {
        console.log('Permission to access location was denied');
      }
      Location.getCurrentPositionAsync({}).then(location => {
        setLocation(location);
      });
      Location.watchPositionAsync({timeInterval: 60000, accuracy: LocationAccuracy.BestForNavigation}, () => {
        if (agent) {
          setLocation(location);
          agent.updateLocation(createLocation());
        }
      }).catch(console.error);
    });
  }, []);

  useEffect(() => {
    if (sipCredentials) {
      interval = setInterval((): void => {
        if (countdown > 0) {
          setCountdown(countdown - 1);
        } else {
          if (interval) {
            onSend();
            clearInterval(interval);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown, sipCredentials]);

  const onAbort = async (): Promise<void> => {
    navigation.goBack();
  };

  const onSend = async (): Promise<void> => {
    clearInterval(interval);
    setCountdown(0);
    requestEmergency();
  };

  const createLocation = (): SimpleLocation | undefined => {
    if (location) {
      return {
        latitude: location?.coords?.latitude || undefined,
        longitude: location?.coords?.longitude || undefined,
        radius: location?.coords?.accuracy || undefined,
        method: LocationMethod.GPS,
        timestamp: location.timestamp ? new Date(location.timestamp) : undefined,
      };
    }
    return undefined;
  };

  const requestEmergency = async () => {
    if (alarmTriggered) {
      return;
    }
    setAlarmTriggered(true);
    try {
      const sipPassword = sipCredentials!['password'];
      const sipUser = sipCredentials!['username'];
      agent = new Agent({
        endpoint: 'wss://app.staging.dec112.eu:443',
        domain: 'app.staging.dec112.eu',
        user: sipUser,
        password: sipPassword,
        displayName: displayName,
        namespaceSpecifics: new DEC112Specifics(undefined, '' || '', 'de'),
        userAgentConfig: {
          connection_recovery_max_interval: 5,
          connection_recovery_min_interval: 2,
          user_agent: `com.sphereon.ssi.wallet`,
        },
      });
      agent.updateLocation(createLocation());
      agent.addStateListener(console.info);
      agent
        .initialize()
        .then(() => {
          console.info('SIP registration successful');
          const vcard = new VCard()
            .addFullName(displayName)
            .addCode(idAustriaData?.adresse?.Postleitzahl ?? '')
            .addLocality(idAustriaData?.adresse?.Ortschaft ?? '')
            .addStreet(`${idAustriaData?.adresse?.Strasse ?? ''} ${idAustriaData?.adresse?.Hausnummer ?? ''}`);
          agent?.updateVCard(vcard);
          const conversation = agent?.createConversation('sip:144@app.staging.dec112.eu' || '', {});
          conversation?.addMessageListener(console.log);
          conversation?.addStateListener(console.log);
          console.log('Trying to send start message');
          const startMessage = conversation?.start({
            text: 'Silent Call from SSI Wallet',
            extraHeaders: [{key: 'X-Dec112-Silent', value: 'True'}],
          });
          startMessage?.promise
            .then(() => {
              console.info('Start message sent successful');
              Alert.alert('Message sent', 'Start message sent successfully', [
                {
                  text: 'OK',
                },
              ]);
            })
            .catch(console.error);
        })
        .catch((error: unknown) => {
          console.error('SIP registration error', error);
          Alert.alert('Error', 'Failed to connect to the call center', [
            {
              text: 'OK',
            },
          ]);
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <StatusBar backgroundColor={backgroundColors.orange} />
      <CountdownOuterContainer>
        <CountdownMiddleContainer>
          <CountdownInnerContainer>
            <CountdownText>{countdown}</CountdownText>
          </CountdownInnerContainer>
        </CountdownMiddleContainer>
      </CountdownOuterContainer>
      <ButtonContainer>
        <SecondaryButton
          style={{height: 42, width: 300}}
          borderColors={[fontColors.light]}
          captionColor={fontColors.light}
          caption={translate('emergency_abort_button_caption')}
          onPress={onAbort}
        />
        {!alarmTriggered ? (
          <PrimaryButton
            style={{height: 42, width: 300}}
            caption={translate('emergency_send_button_caption')}
            backgroundColors={[buttonColors[100]]}
            captionColor={fontColors.light}
            onPress={onSend}
          />
        ) : null}
      </ButtonContainer>
    </Container>
  );
};

export default EmergencyScreen;
