import React, { FC } from 'react'
import { StatusBar } from 'react-native'
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
