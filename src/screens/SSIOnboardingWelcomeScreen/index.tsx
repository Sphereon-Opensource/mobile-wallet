import React, { PureComponent } from 'react'
import { BackHandler, NativeEventSubscription, StatusBar } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'
import { connect } from 'react-redux'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import { IUser } from '../../@types/store/user.types'
import WelcomeBackground from '../../assets/images/welcomeIntroBackground.svg'
import SSIWelcomeView from '../../components/views/SSIWelcomeView'
import { translate } from '../../localization/Localization'
import { setUser } from '../../store/actions/user.actions'
import {
  SSIOnboardingWelcomeScreenBackgroundContainerStyled as BackgroundContainer,
  SSIOnboardingWelcomeScreenContainerStyled as Container,
  SSIOnboardingWelcomeScreenIntroBackgroundContainerStyled as IntroBackgroundContainer,
  SSIOnboardingWelcomeScreenWelcomeViewContainerStyled as WelcomeViewContainer
} from '../../styles/components'

interface IScreenProps extends NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ONBOARDING_WELCOME> {
  setUser: (args: IUser) => void
}

interface IScreenState {
  body: string
  step: number
}

class SSIOnboardingWelcomeScreen extends PureComponent<IScreenProps, IScreenState> {
  hardwareBackPressListener: NativeEventSubscription
  state = {
    body: translate('onboarding_welcome_intro_body'),
    step: 1
  }

  componentDidMount = (): void => {
    this.hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', this._onBack)
  }

  componentWillUnmount = (): void => {
    this.hardwareBackPressListener.remove()
  }

  _onBack = (): boolean => {
    const { step } = this.state

    /**
     * When true is returned the event will not be bubbled up
     * & no other back action will execute
     */
    switch (step) {
      case 2:
        this.setState({ step: step - 1, body: translate('onboarding_welcome_intro_body') })
        return true
      case 3:
        this.setState({ step: step - 1, body: translate('onboarding_welcome_store_body') })
        return true
      default:
        /**
         * Returning false will let the event bubble up & let other event listeners
         * or the system's default back action to be executed.
         */
        return false
    }
  }

  onNext = async (): Promise<void> => {
    const { step } = this.state

    switch (step) {
      case 1:
        this.setState({ step: step + 1, body: translate('onboarding_welcome_store_body') })
        break
      case 2:
        this.setState({ step: step + 1, body: translate('onboarding_welcome_share_body') })
        break
      default:
        // TODO WAL-407 implement user functionality
        this.props.setUser({ name: 'dummy' })
    }
  }

  render() {
    const { body, step } = this.state
    const MAX_WELCOME_STEPS = 3

    return (
      <Container>
        <StatusBar translucent backgroundColor="transparent" />
        {step === 1 ? (
          <IntroBackgroundContainer>
            <WelcomeBackground />
          </IntroBackgroundContainer>
        ) : (
          <BackgroundContainer>
            {/* TODO WAL-406 fix images not loading */}
            {/* <Image source={require('../../assets/images/test.png')} style={{ resizeMode: 'stretch', width: 290, height: 586, backgroundColor: 'red', marginTop: 80}}/>*/}
          </BackgroundContainer>
        )}
        <WelcomeViewContainer>
          <SSIWelcomeView
            step={step}
            maxSteps={MAX_WELCOME_STEPS}
            body={body}
            header={translate('onboarding_welcome_header')}
            title={translate('onboarding_welcome_title')}
            action={{
              caption: translate('next_action_confirm'),
              onPress: this.onNext
            }}
          />
        </WelcomeViewContainer>
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    setUser: (args: IUser) => dispatch(setUser(args))
  }
}

export default connect(null, mapDispatchToProps)(SSIOnboardingWelcomeScreen)
