import React, { FC, useEffect, useState } from 'react';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { backgroundColors, fontColors, buttonColors } from '@sphereon/ui-components.core';
import { PrimaryButton, SecondaryButton } from '@sphereon/ui-components.ssi-react-native';
import { translate } from '../../localization/Localization';
import { EMERGENCY_ALERT_DELAY } from '../../@config/constants';
import {
  EmergencyScreenContainerStyled as Container,
  SSIStatusBarDarkModeStyled as StatusBar,
  EmergencyScreenCountdownOuterContainerStyled as CountdownOuterContainer,
  EmergencyScreenCountdownMiddleContainerStyled as CountdownMiddleContainer,
  EmergencyScreenCountdownInnerContainerStyled as CountdownInnerContainer,
  EmergencyScreenButtonContainerStyled as ButtonContainer,
  EmergencyScreenCountdownTextStyled as CountdownText,
} from '../../styles/components';
import { ScreenRoutesEnum, StackParamList } from '../../types';
import { Agent, VCard, DEC112Specifics, SimpleLocation } from 'ng112-js/dist/node';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import { LocationMethod } from 'pidf-lo';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.EMERGENCY>;

const EmergencyScreen: FC<Props> = (props: Props): JSX.Element => {
  const { navigation } = props;
  const [countdown, setCountdown] = useState<number>(EMERGENCY_ALERT_DELAY);
  const [location, setLocation] = useState<LocationObject | null>(null);

  // FIXME WAL-681 remove work around https://github.com/react-navigation/react-navigation/issues/11139
  void changeNavigationBarColor(backgroundColors.orange);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    Location.requestForegroundPermissionsAsync().then((status) => {
      if (status.status !== 'granted') {
        console.log('Permission to access location was denied');
      }
      Location.getCurrentPositionAsync({}).then((location) => {
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
        timestamp: location.timestamp ? new Date(location.timestamp) : undefined
      };
    }
    return undefined;
  };

  const requestEmergency = async () => {
    try {
      const agent = new Agent({
        endpoint: 'wss://app.staging.dec112.eu:443',
        domain: 'app.staging.dec112.eu',
        user: '8ea1b78ba4db367102cfd9a41e34fb39',
        password: 'd7c1a156b1c9e1fc27870c514dfaf25a',
        displayName: '0043555777777777',
        namespaceSpecifics: new DEC112Specifics(undefined, '' || '', 'de'),
        debug: (_level: number, ...values: unknown[]): void => {
          console.debug(values);
        },
        userAgentConfig: {
          connection_recovery_max_interval: 5,
          connection_recovery_min_interval: 2,
          user_agent: `com.sphereon.ssi.wallet`
        }
      });
      agent.updateLocation(createLocation());
      agent.addStateListener(console.info);
      agent
        .initialize()
        .then(() => {
          console.info('SIP registration successful');
          agent?.updateVCard(new VCard().addFullName('Sphereon MDM'));
          const conversation = agent?.createConversation('sip:144@app.staging.dec112.eu' || '', {});
          conversation.addMessageListener(console.log);
          conversation.addStateListener(console.log);
          console.log('Trying to send start message');
          const startMessage = conversation?.start({
            text: 'Silent Call from SSI Wallet',
            extraHeaders: [{ key: 'X-Dec112-Silent', value: 'True' }]
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
      <StatusBar backgroundColor={backgroundColors.orange}/>
      <CountdownOuterContainer>
        <CountdownMiddleContainer>
          <CountdownInnerContainer>
            <CountdownText>{countdown}</CountdownText>
          </CountdownInnerContainer>
        </CountdownMiddleContainer>
      </CountdownOuterContainer>
      <ButtonContainer>
        <SecondaryButton
          style={{ height: 42, width: 300 }}
          borderColors={[fontColors.light]}
          captionColor={fontColors.light}
          caption={translate('emergency_abort_button_caption')}
          onPress={onAbort}
        />
        <PrimaryButton
          style={{ height: 42, width: 300 }}
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
