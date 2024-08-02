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
import {addMessageListener, initializeSdk} from '@animo-id/expo-ausweis-sdk';
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

  const [isSdkInitialized, setIsSdkInitialized] = useState(false);

  useEffect(
    addMessageListener(message => {
      console.log('received message', JSON.stringify(message, null, 2));
    }).remove,
    [],
  );

  const initSDK = async () => {
    initializeSdk()
      .then(() => setIsSdkInitialized(true))
      .catch(e => {
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
      <Text style={{color: 'white', fontSize: 16}}>{isSdkInitialized ? 'initialized' : 'uninitialized'}</Text>
      <ButtonContainer>
        <PrimaryButton
          // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
          style={{height: 42, width: 300}}
          caption={action.caption}
          // onPress={action.onPress}
          onPress={initSDK}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSIWelcomeView;
