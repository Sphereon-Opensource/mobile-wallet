import React, {FC, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageAttributes} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton, SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import SSIActivityView from '../../components/views/SSIActivityView';
import SSICredentialDetailsView from '../../components/views/SSICredentialDetailsView';
import SSITabView from '../../components/views/SSITabView';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {translate} from '../../localization/Localization';
import {
  CredentialDetailsScreenButtonContainer as ButtonContainer,
  CredentialDetailsScreenButtonContentContainer as ButtonContainerContent,
  CredentialDetailsScreenCredentialCardContainer as CardContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  CredentialDetailsScreenContentContainer as ContentContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {EIDFlowState, ITabViewRoute, ScreenRoutesEnum, StackParamList} from '../../types';
import {useBackHandler} from '@react-native-community/hooks';
import {addMessageListener, AusweisAuthFlow, AusweisSdkMessage, initializeSdk, sendCommand} from '@animo-id/expo-ausweis-sdk';
import {Button, Text, View} from 'react-native';
import EIDProvider from '../../providers/authentication/eIDProvider';
import {OpenID4VCIClient} from '@sphereon/oid4vci-client';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_DETAILS>;

enum CredentialTabRoutesEnum {
  INFO = 'info',
  ACTIVITY = 'activity',
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

const CredentialDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {credential, primaryAction, secondaryAction, showActivity = false, onBack} = props.route.params;
  const issuer: string = credential.issuer.alias;
  const credentialCardLogo: ImageAttributes | undefined = getCredentialCardLogo(credential);

  const [isSdkInitialized, setIsSdkInitialized] = useState(false);
  const [testMessage, setTestMessage] = useState<AusweisSdkMessage>();

  const [state, setState] = useState<EIDFlowState>();
  const [provider, setProvider] = useState<EIDProvider>();

  // Initialize SDK
  // useEffect(() => {
  //   initializeSdk()
  //     .then(() => setIsSdkInitialized(true))
  //     .catch(e => {
  //       console.log('error setting up', e);
  //     });
  // }, []);

  // useEffect(
  //     addMessageListener((message: AusweisSdkMessage) => {
  //       //
  //       // console.log(`testMessage: ${JSON.stringify(testMessage) }`)
  //       // console.log(`message: ${JSON.stringify(message)}`)
  //       if (JSON.stringify(testMessage) !== JSON.stringify(message)) {
  //         console.log('received message', JSON.stringify(message, null, 2))
  //
  //         // setTestMessage(message)
  //       }
  //     }).remove,
  //     []
  // )
  //
  // useEffect(() => {
  //   initializeSdk()
  //       .then(() => setIsSdkInitialized(true))
  //       .catch((e) => {
  //         console.log('error setting up', e)
  //       })
  // }, [])

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
    EIDProvider.initialize({
      //tcTokenUrl: 'https://test.governikus-eid.de/AusweisAuskunft/WebServiceRequesterServlet',
      onStateChange: setState,
      onEnterPin: () => '654321',
    }).then(eIDProvider => {
      setProvider(eIDProvider);
      eIDProvider.start();
    });
  };

  const routes: Array<ITabViewRoute> = [
    {
      key: CredentialTabRoutesEnum.INFO,
      title: translate('credential_details_info_tab_header_label'),
      content: () => <SSICredentialDetailsView credentialProperties={credential.properties} issuer={issuer} />,
    },
    ...(showActivity
      ? [
          {
            key: CredentialTabRoutesEnum.ACTIVITY,
            title: translate('credential_details_activity_tab_header_label'),
            content: () => <SSIActivityView />,
          },
        ]
      : []),
  ];

  useBackHandler((): boolean => {
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    navigation.goBack();
    return true;
  });

  return (
    <Container>
      <StatusBar />
      <ContentContainer>
        <CardContainer>
          <SSICredentialCardView
            header={{
              credentialTitle: credential.title ?? credential.branding?.alias,
              credentialSubtitle: credential.branding?.description,
              logo: credentialCardLogo,
            }}
            body={{
              issuerName: issuer ?? credential.issuer.name,
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
        </CardContainer>
        {/*{isSdkInitialized ? <Text style={{color: 'white'}}>Initialized</Text> : <Text style={{color: 'white'}}>NOT Initialized</Text>}*/}

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

        <Button title={'START AUTH FLOW'} onPress={runAuth} />
        <View style={{height: 50}} />

        <Button title={'CANCEL FLOW'} onPress={cancelFlow} />
        <View style={{height: 50}} />

        <Button title={'PRINT PROVIDER SATE'} onPress={printState} />
        <View style={{height: 50}} />

        <SSITabView routes={routes} />
        {/* TODO we use this 2 button structure a lot, we should make a component out of it */}
        {(primaryAction || secondaryAction) && (
          <ButtonContainer>
            <ButtonContainerContent>
              {secondaryAction && (
                <SecondaryButton
                  caption={secondaryAction.caption}
                  onPress={secondaryAction.onPress}
                  // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
                  style={{
                    height: 42,
                    minWidth: 160,
                    ...(!primaryAction && {width: '100%'}),
                  }}
                />
              )}
              {primaryAction && (
                <PrimaryButton
                  caption={primaryAction.caption}
                  onPress={primaryAction.onPress}
                  // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
                  style={{
                    height: 42,
                    minWidth: 160,
                    // ...(!secondaryAction && {width: '100%'}),
                  }}
                />
              )}
            </ButtonContainerContent>
          </ButtonContainer>
        )}
      </ContentContainer>
    </Container>
  );
};

export default CredentialDetailsScreen;
