import React, { FC } from 'react'
import { StatusBar } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIWelcomeView from '../../components/views/SSIWelcomeView'
import { translate } from '../../localization/Localization'
import {
  SSILinearGradientWelcomeStyled as BackgroundContainer,
  SSIOnboardingWelcomeStoreScreenContainerStyled as Container,
  SSIOnboardingWelcomeStoreScreenWelcomeViewContainerStyled as WelcomeViewContainer
} from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ONBOARDING_WELCOME_STORE>

const SSIOnboardingWelcomeStoreScreen: FC<Props> = (props: Props): JSX.Element => {
  return (
      <Container>
        <StatusBar translucent backgroundColor="transparent" />
        <BackgroundContainer style={{flex: 1, alignItems: 'center'}}>
          {/* TODO fix images not loading*/}
          {/* <Image source={require('../../assets/images/PNG_transparency_demonstration_1.png')} style={{ resizeMode: 'stretch', width: 290, height: 586, backgroundColor: 'red', marginTop: 80}}/>*/}
        </BackgroundContainer>
        <WelcomeViewContainer>
          <SSIWelcomeView
              step={2}
              maxSteps={3}
              header={translate('onboarding_welcome_header')}
              title={translate('onboarding_welcome_title')}
              body={translate('onboarding_welcome_store_body')}
              action={{
                caption: translate('next_action_confirm'),
                onPress: async () => props.navigation.navigate(ScreenRoutesEnum.ONBOARDING_WELCOME_SHARE, {})
              }}
          />
        </WelcomeViewContainer>
      </Container>
  )
}

export default SSIOnboardingWelcomeStoreScreen
