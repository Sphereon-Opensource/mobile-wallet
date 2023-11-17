import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC, useState} from 'react';
import {Platform, StatusBar} from 'react-native';

import WelcomeBackground from '../../../assets/images/welcomeIntroBackground.svg';
import SSIWelcomeView from '../../../components/views/SSIWelcomeView';
import {translate} from '../../../localization/Localization';
import {
  SSIWelcomeScreenContainerStyled as Container,
  SSIWelcomeScreenIntroBackgroundContainerStyled as IntroBackgroundContainer,
  SSIWelcomeScreenWelcomeViewContainerStyled as WelcomeViewContainer,
} from '../../../styles/components';
import {PlatformsEnum, ScreenRoutesEnum, StackParamList} from '../../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.WELCOME>;

interface IState {
  body: string;
  buttonCaption: string;
  step: number;
}

const SSIWelcomeScreen: FC<Props> = (props: Props): JSX.Element => {
  if (Platform.OS === PlatformsEnum.ANDROID) {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }

  const [state, setState] = useState<IState>({
    body: translate('onboarding_welcome_intro_body'),
    buttonCaption: translate('action_next_label'),
    step: 1,
  });

  useBackHandler(() => {
    const {step} = state;

    /**
     * When true is returned the event will not be bubbled up
     * & no other back action will execute
     */
    switch (step) {
      case 2:
        setState({step: step - 1, body: translate('onboarding_welcome_intro_body'), buttonCaption: translate('action_next_label')});
        return true;
      case 3:
        setState({
          step: step - 1,
          body: translate('onboarding_welcome_store_body'),
          buttonCaption: translate('action_next_label'),
        });
        return true;
      default:
        /**
         * Returning false will let the event bubble up & let other event listeners
         * or the system's default back action to be executed.
         */
        return false;
    }
  });

  const onNext = async (): Promise<void> => {
    const {step} = state;

    switch (step) {
      case 1:
        setState({step: step + 1, body: translate('onboarding_welcome_store_body'), buttonCaption: translate('action_next_label')});
        break;
      case 2:
        setState({
          step: step + 1,
          body: translate('onboarding_welcome_share_body'),
          buttonCaption: translate('action_go_label'),
        });
        break;
      default:
        await props.route.params.onNext();
    }
  };

  const {body, buttonCaption, step} = state;
  const MAX_WELCOME_STEPS = 3;

  return (
    <Container>
      {/* TODO WAL-406 for now we show the svg background for all welcome steps */}
      <IntroBackgroundContainer>
        <WelcomeBackground />
      </IntroBackgroundContainer>
      {/*{step === 1 ? (*/}
      {/*  <IntroBackgroundContainer>*/}
      {/*    <WelcomeBackground />*/}
      {/*  </IntroBackgroundContainer>*/}
      {/*) : (*/}
      {/*  <BackgroundContainer>*/}
      {/*     TODO WAL-406 fix images not loading */}
      {/*     <Image source={require('../../assets/images/test.png')} style={{ resizeMode: 'stretch', width: 290, height: 586, backgroundColor: 'red', marginTop: 80}}/>*/}
      {/*  </BackgroundContainer>*/}
      {/*)}*/}
      <WelcomeViewContainer>
        <SSIWelcomeView
          step={step}
          maxSteps={MAX_WELCOME_STEPS}
          body={body}
          header={translate('onboarding_welcome_header')}
          title={translate('onboarding_welcome_title')}
          action={{
            caption: buttonCaption,
            onPress: onNext,
          }}
        />
      </WelcomeViewContainer>
    </Container>
  );
};

export default SSIWelcomeScreen;
