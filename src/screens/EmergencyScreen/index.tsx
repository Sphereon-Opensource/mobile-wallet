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
  const [displayName, setDisplayName] = useState('');
  const [countdown, setCountdown] = useState<number>(EMERGENCY_ALERT_DELAY);
  const [location, setLocation] = useState<LocationObject | null>(null);
  let agent: Agent | null = null;

  // FIXME WAL-681 remove work around https://github.com/react-navigation/react-navigation/issues/11139
  void changeNavigationBarColor(backgroundColors.orange);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    getVerifiableCredentialsFromStorage().then(async (credentials: Array<UniqueVerifiableCredential>): Promise<void> => {
      const dec112Credential = credentials.find(c => c.verifiableCredential.type && c.verifiableCredential.type.indexOf('DEC112Credential') > -1);
      if (dec112Credential) {
        console.log(dec112Credential);
        const idAustriaData = dec112Credential.verifiableCredential.credentialSubject['id_austria'];
        const sipData = dec112Credential.verifiableCredential.credentialSubject['sip'];
        const sipDataCredentials = sipData['sip_credentials'];
        setSipCredentials(sipDataCredentials);
        setDisplayName(`${idAustriaData['vorname'] ?? ''} ${idAustriaData['vorname'] ?? ''}`);
      }
    });
    Location.requestForegroundPermissionsAsync().then(status => {
      if (status.status !== 'granted') {
        console.log('Permission to access location was denied');
      }
      Location.getCurrentPositionAsync({}).then(location => {
        setLocation(location);
        interval = setInterval((): void => {
          if (countdown > 0) {
            setCountdown(countdown - 1);
          } else {
            if (interval) {
              clearInterval(interval);
            }
            void onSend();
          }
        }, 1000);
      });
      Location.watchPositionAsync({timeInterval: 60000, accuracy: LocationAccuracy.BestForNavigation}, () => {
        if (agent) {
          setLocation(location);
          agent.updateLocation(createLocation());
        }
      }).catch(console.error);
    });

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown]);

  const onAbort = async (): Promise<void> => {
    navigation.goBack();
  };

  const onSend = async (): Promise<void> => {
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
        debug: (_level: number, ...values: unknown[]): void => {
          console.debug(values);
        },
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
          agent?.updateVCard(new VCard().addFullName(displayName));
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
        <PrimaryButton
          style={{height: 42, width: 300}}
          caption={translate('emergency_send_button_caption')}
          backgroundColors={[buttonColors[100]]}
          captionColor={fontColors.light}
          onPress={onSend}
        />
      </ButtonContainer>
    </Container>
  );
};

export default EmergencyScreen;
