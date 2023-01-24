import React, { FC } from 'react'
import { StatusBar } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'

import {RootRoutesEnum, ScreenRoutesEnum, StackParamList} from '../../@types'
import SSIWelcomeView from '../../components/views/SSIWelcomeView'
import { translate } from '../../localization/Localization'
import {
  SSILinearGradientWelcomeStyled as BackgroundContainer,
  SSIOnboardingWelcomeShareScreenContainerStyled as Container,
  SSIOnboardingWelcomeShareScreenWelcomeViewContainerStyled as WelcomeViewContainer
} from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ONBOARDING_WELCOME_SHARE>

// TODO check for image source cast solution https://github.com/expo/expo/issues/18328
const SSIOnboardingWelcomeShareScreen: FC<Props> = (props: Props): JSX.Element => {
  return (
      <Container>
        <StatusBar translucent backgroundColor="transparent" />
        <BackgroundContainer style={{flex: 1, alignItems: 'center'}}>
          {/* TODO fix images not loading*/}
          {/* <Image source={require('../../../assets/images/screen1.png')} style={{ resizeMode: 'stretch', width: 300, height: '100%', backgroundColor: 'red', marginTop: 80}}/>*/}
        </BackgroundContainer>
        <WelcomeViewContainer>
          <SSIWelcomeView
              step={3}
              maxSteps={3}
              header={translate('onboarding_welcome_header')}
              title={translate('onboarding_welcome_title')}
              body={translate('onboarding_welcome_share_body')}
              action={{
                caption: translate('next_action_confirm'),
                onPress: async () => props.navigation.navigate(RootRoutesEnum.MAIN, {})
              }}
          />
        </WelcomeViewContainer>
      </Container>
  )
}

export default SSIOnboardingWelcomeShareScreen
