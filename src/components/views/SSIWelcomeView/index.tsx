import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, useEffect, useState} from 'react';
import {
  SSIWelcomeViewBodyContainerStyled as BodyContainer,
  SSITextH3RegularLightStyled as BodyText,
  SSIButtonBottomContainerStyled as ButtonContainer,
  SSIWelcomeViewContainerStyled as Container,
  SSIWelcomeViewContentContainerStyled as ContentContainer,
  SSIWelcomeViewHeaderTextStyled as HeaderCaption,
  SSIWelcomeViewProgressIndicatorContainerStyled as ProgressIndicatorContainer,
  SSIWelcomeViewTitleTextStyled as TitleCaption,
} from '../../../styles/components';
import {IButton} from '../../../types';
import SSIProgressIndicator from '../../indicators/SSIProgressIndicator';
import {AusweisAuthFlow, addMessageListener, initializeSdk} from '@animo-id/expo-ausweis-sdk';
import {Text} from 'react-native';

export interface IProps {
  step: number;
  maxSteps: number;
  header: string;
  title: string;
  body: string;
  action: IButton;
}

const SSIWelcomeView: FC<IProps> = (props: IProps): JSX.Element => {
  const {action, body, header, step, title, maxSteps} = props;

  const [flow, setFlow] = useState<AusweisAuthFlow>();
  const [message, setMessage] = useState<string>();
  const [isSdkInitialized, setIsSdkInitialized] = useState(false);

  useEffect(
    addMessageListener(message => {
      console.log('received message', JSON.stringify(message, null, 2));
    }).remove,
    [],
  );

  const cancelFlow = () =>
    flow
      ?.cancel()
      .then(() => setFlow(undefined))
      .catch(error => setMessage(`Error canceling flow. ${error.message}`));

  const runAuthFlow = async () => {
    setMessage(undefined);
    setFlow(
      new AusweisAuthFlow({
        onEnterPin: ({attemptsRemaining}) => {
          // Mock incorrect pin entry
          return attemptsRemaining === 1 ? '123456' : '123123';
        },
        onError: ({message, reason}) => {
          setFlow(undefined);
          setMessage(`${reason}: ${message}`);
        },
        onSuccess: () => {
          setFlow(undefined);
          setMessage('Successfully ran auth flow');
        },
        onInsertCard: () => {
          // For iOS this will show the NFC scanner modal. on Android we need
          // use this callback to show the NFC scanner modal.
          console.log('please insert card');
        },
      }).start({
        tcTokenUrl: 'https://test.governikus-eid.de/AusweisAuskunft/WebServiceRequesterServlet',
      }),
    );
  };
  const initSDK = async () => {
    initializeSdk()
      .then(() => setIsSdkInitialized(true))
      .catch(e => {
        setIsSdkInitialized(false);
        console.log('error setting up', e);
      });
  };

  return (
    <Container>
      <ProgressIndicatorContainer>
        <SSIProgressIndicator step={step} maxSteps={maxSteps} />
      </ProgressIndicatorContainer>
      <ContentContainer>
        <HeaderCaption>{header}</HeaderCaption>
        <TitleCaption>{title}</TitleCaption>
        <BodyContainer>
          <BodyText>{body}</BodyText>
        </BodyContainer>
      </ContentContainer>
      <Text style={{color: 'white', fontSize: 16}}>{isSdkInitialized}</Text>
      <ButtonContainer>
        <PrimaryButton
          // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
          style={{height: 42, width: 300}}
          caption={'INIT SDK'}
          // onPress={action.onPress}
          onPress={initSDK}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSIWelcomeView;
