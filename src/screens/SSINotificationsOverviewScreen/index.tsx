import {AusweisAuthFlow, AusweisSdkMessage, sendCommand} from '@animo-id/expo-ausweis-sdk';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useState} from 'react';
import {Button, View, Text} from 'react-native';
import {translate} from '../../localization/Localization';
import PIDServiceGermany from '../../providers/authentication/PIDServiceGermany';
import {
  SSIBasicContainerStyled as Container,
  SSINotificationsOverviewScreenEmptyStateContainerStyled as EmptyStateContainer,
  SSINotificationsOverviewScreenEmptyStateTitleTextStyled as TitleText,
  SSITextH4LightStyled as SubTitleText,
} from '../../styles/components';
import {EIDFlowState, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NOTIFICATIONS_OVERVIEW>;

const SSINotificationsOverviewScreen: FC<Props> = (props: Props): JSX.Element => {
  const [testMessage, setTestMessage] = useState<AusweisSdkMessage>();

  const [state, setState] = useState<EIDFlowState>();
  const [provider, setProvider] = useState<PIDServiceGermany>();

  const initPIDService = async () => {
    PIDServiceGermany.initialize({
      onEnterPin: () => '654321',
      onAuthenticated: console.log,
      onStateChange: setState,
    }).then(service => {
      console.log('SET SERVICE');
      setProvider(service);
      service.start();
    });
  };

  const onStart = async () => {
    new AusweisAuthFlow({
      onEnterPin: ({attemptsRemaining}) => {
        console.log('ENTER PIN');

        // Mock incorrect pin entry
        return '654321'; //attemptsRemaining === 1 ? '123456' : '123123'
      },
      onError: ({message, reason}) => {
        console.log(`${reason}: ${message}`);
      },
      onSuccess: options => {
        // setFlow(undefined)
        // setShowModal(false)

        console.log(`ON SUCCESS: ${JSON.stringify(options)}`);

        console.log('Successfully ran auth flow');
      },
      onInsertCard: () => {
        // setShowModal(true)
        // For iOS this will show the NFC scanner modal. on Android we need
        // use this callback to show the NFC scanner modal.
        console.log('please insert card');
      },
    }).start({
      tcTokenUrl: 'https://test.governikus-eid.de/AusweisAuskunft/WebServiceRequesterServlet',
    });
  };

  // const enterPin = async () => {
  //
  // }

  const startAuth = async () => {
    sendCommand({
      cmd: 'RUN_AUTH',
      tcTokenURL: 'https://test.governikus-eid.de/AusweisAuskunft/WebServiceRequesterServlet',
      developerMode: true,
      handleInterrupt: false,
      status: true,
      messages: {
        sessionStarted: "Please place your ID card on the top of the device's back side.",
        sessionFailed: 'Scanning process failed.',
        sessionSucceeded: 'Scanning process has been finished successfully.',
        sessionInProgress: 'Scanning process is in progress.',
      },
    });
  };

  const accept = async () => {
    sendCommand({cmd: 'ACCEPT'});
  };

  const enterCAN = async () => {
    sendCommand({
      cmd: 'SET_CAN',
      value: '941253',
    });
  };

  const setPUK = async () => {
    sendCommand({cmd: 'SET_PUK', value: '1133557799'});
  };

  const setPin = async () => {
    sendCommand({cmd: 'SET_PIN', value: '654321'});
  };

  const cancelFlow = async () => {
    provider?.cancel();
  };

  const printState = async () => {
    console.log(JSON.stringify(provider?.currentState));
  };

  const runAuth = async () => {
    /*PIDServiceGermany.initialize({
      //tcTokenUrl: 'https://test.governikus-eid.de/AusweisAuskunft/WebServiceRequesterServlet',
      onStateChange: setState,
      onEnterPin: () => '654321',
    }).then(eIDProvider => {
      setProvider(eIDProvider);
      eIDProvider.start();
    });*/
  };

  return (
    // This currently now only shows the empty state.
    <Container>
      <EmptyStateContainer>
        {<Text style={{color: 'white'}}>{`CALLBACK STATE`}</Text>}
        {<Text style={{color: 'white'}}>{`STATE: ${state?.state}`}</Text>}
        {<Text style={{color: 'white'}}>{`PROGRESS: ${state?.progress}`}</Text>}
        {<Text style={{color: 'white'}}>{`REASON: ${state?.reason}`}</Text>}
        <View style={{height: 50}} />
        {<Text style={{color: 'white'}}>{`PROVIDER STATE`}</Text>}
        {<Text style={{color: 'white'}}>{`STATE: ${provider?.currentState.state}`}</Text>}
        {<Text style={{color: 'white'}}>{`PROGRESS: ${provider?.currentState.progress}`}</Text>}
        {<Text style={{color: 'white'}}>{`REASON: ${provider?.currentState.reason}`}</Text>}

        {/*<Button  onPress={onStart}  title={'START'}/>*/}

        {/*<View style={{ height: 50 }}/>*/}
        {/*<Button title={'START AUTH'} onPress={startAuth}/>*/}
        {/*<View style={{ height: 50 }}/>*/}
        {/*<Button title={'ACCEPT'} onPress={accept}/>*/}
        {/*<View style={{ height: 50 }}/>*/}
        {/*<Button title={'ENTER CAN'} onPress={enterCAN}/>*/}
        {/*<View style={{ height: 50 }}/>*/}
        {/*<Button title={'ENTER PUK'} onPress={setPUK}/>*/}
        {/*<View style={{ height: 50 }}/>*/}
        {/*<Button title={'SET PIN'} onPress={setPin}/>*/}

        {/*<Button title={'START AUTH FLOW'} onPress={onStart}/>*/}
        {/*<View style={{ height: 50 }}/>*/}

        {<Button title={'START AUTH FLOW'} onPress={initPIDService} />}
        <View style={{height: 50}} />

        <Button title={'CANCEL FLOW'} onPress={cancelFlow} />
        <View style={{height: 50}} />

        <Button title={'PRINT PROVIDER SATE'} onPress={printState} />
        <View style={{height: 50}} />

        {/*        <TitleText>{translate('notifications_overview_empty_state_title')}</TitleText>
        <SubTitleText>{translate('notifications_overview_empty_state_subtitle')}</SubTitleText>*/}
      </EmptyStateContainer>
    </Container>
  );
};

export default SSINotificationsOverviewScreen;
