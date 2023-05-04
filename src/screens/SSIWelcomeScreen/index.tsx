import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {PureComponent} from 'react';
import {BackHandler, NativeEventSubscription, StatusBar} from 'react-native';

import WelcomeBackground from '../../assets/images/welcomeIntroBackground.svg';
import SSIWelcomeView from '../../components/views/SSIWelcomeView';
import {translate} from '../../localization/Localization';
import {
  // SSIWelcomeScreenBackgroundContainerStyled as BackgroundContainer,
  SSIWelcomeScreenContainerStyled as Container,
  SSIWelcomeScreenIntroBackgroundContainerStyled as IntroBackgroundContainer,
  SSIWelcomeScreenWelcomeViewContainerStyled as WelcomeViewContainer,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.WELCOME>;

interface IState {
  body: string;
  buttonCaption: string;
  step: number;
}

class SSIWelcomeScreen extends PureComponent<Props, IState> {
  hardwareBackPressListener: NativeEventSubscription;
  state: IState = {
    body: translate('onboarding_welcome_intro_body'),
    buttonCaption: translate('action_next_label'),
    step: 1,
  };

  _onBack = (): boolean => {
    const {step} = this.state;

    /**
     * When true is returned the event will not be bubbled up
     * & no other back action will execute
     */
    switch (step) {
      case 2:
        this.setState({step: step - 1, body: translate('onboarding_welcome_intro_body')});
        return true;
      case 3:
        this.setState({
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
  };

  componentDidMount = (): void => {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
    this.hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', this._onBack);
  };

  componentWillUnmount = (): void => {
    this.hardwareBackPressListener.remove();
  };

  onNext = async (): Promise<void> => {
    const {step} = this.state;

    switch (step) {
      case 1:
        this.setState({step: step + 1, body: translate('onboarding_welcome_store_body')});
        break;
      case 2:
        this.setState({
          step: step + 1,
          body: translate('onboarding_welcome_share_body'),
          buttonCaption: translate('action_go_label'),
        });
        break;
      default:
        this.props.navigation.navigate(ScreenRoutesEnum.TERMS_OF_SERVICE, {});
    }
  };

  render() {
    const {body, buttonCaption, step} = this.state;
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
              onPress: this.onNext,
            }}
          />
        </WelcomeViewContainer>
      </Container>
    );
  }
}

export default SSIWelcomeScreen;
