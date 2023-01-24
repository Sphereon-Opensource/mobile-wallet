import React, { FC } from 'react'
import { BackHandler, StatusBar } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import WelcomeBackground from '../../assets/images/welcomeIntroBackground.svg'
import SSIWelcomeView from '../../components/views/SSIWelcomeView'
import { translate } from '../../localization/Localization'
import {
  SSIOnboardingWelcomeIntroScreenBackgroundContainerStyled as BackgroundContainer,
  SSIOnboardingWelcomeIntroScreenContainerStyled as Container,
  SSIOnboardingWelcomeIntroScreenWelcomeViewContainerStyled as WelcomeViewContainer
} from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ONBOARDING_WELCOME_INTRO>

const SSIOnboardingWelcomeIntroScreen: FC<Props> = (props: Props): JSX.Element => {
  const [step, setStep] = React.useState(1)

  BackHandler.addEventListener('hardwareBackPress', function () {
    /**
     * When true is returned the event will not be bubbled up
     * & no other back action will execute
     */
    if (step === 1) {
      console.log(`back caught`)
    }

    /**
     * Returning false will let the event to bubble up & let other event listeners
     * or the system's default back action to be executed.
     */
    return false;
  });

  return (
      <Container>
        <StatusBar translucent backgroundColor="transparent" />
        <BackgroundContainer>
          <WelcomeBackground />
        </BackgroundContainer>
        <WelcomeViewContainer>
          <SSIWelcomeView
            step={1}
            maxSteps={3}
            header={translate('onboarding_welcome_header')}
            title={translate('onboarding_welcome_title')}
            body={translate('onboarding_welcome_intro_body')}
            action={{
              caption: translate('next_action_confirm'),
              onPress: async () => props.navigation.navigate(ScreenRoutesEnum.ONBOARDING_WELCOME_STORE, {})
            }}
          />
        </WelcomeViewContainer>
      </Container>
  )
}

export default SSIOnboardingWelcomeIntroScreen
