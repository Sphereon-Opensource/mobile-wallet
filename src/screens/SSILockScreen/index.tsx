import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { FC } from 'react';
import { Alert } from 'react-native';

import { PIN_CODE_LENGTH } from '../../@config/constants';
import SSIPinCode from '../../components/pinCodes/SSIPinCode';
import { translate } from '../../localization/Localization';
import { storageGetPin } from '../../services/storageService';
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSILockScreenPinCodeContainerStyled as PinCodeContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import { ScreenRoutesEnum, StackParamList } from '../../types';
import Share from 'react-native-share';
import { CredentialMapper, OriginalVerifiableCredential } from '@sphereon/ssi-types';
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton';
import { Agent, VCard, AgentState, Conversation, ConversationState, DEC112Specifics, EmergencyMessageType, Header } from 'ng112-js/dist/node';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOCK>;

// TODO This screen should be extended to do pin code or biometrics authentication
const SSILockScreen: FC<Props> = (props: Props): JSX.Element => {
  const onVerification = async (value: string): Promise<void> => {
    const { onAuthenticate } = props.route.params;

    // TODO We are currently only supporting a single user right now
    if (value !== (await storageGetPin())) {
      return Promise.reject('Invalid pin code');
    }
    await onAuthenticate();
  };

  const requestEmergency = async () => {
    console.log('REQUEST EMERGENCY');
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
      <StatusBar/>
      <PinCodeContainer>
        <SSIPinCode
          length={PIN_CODE_LENGTH}
          accessibilityLabel={translate('pin_code_accessibility_label')}
          accessibilityHint={translate('pin_code_accessibility_hint')}
          errorMessage={translate('pin_code_invalid_code_message')}
          onVerification={onVerification}
        />

      </PinCodeContainer>
      <SSIPrimaryButton
        caption={'Request Emergency'}
        onPress={requestEmergency}
        disabled={false}
        style={{ flex: 1, height: 42, margin: 50 }}
      />
    </Container>
  );
};

export default SSILockScreen;
