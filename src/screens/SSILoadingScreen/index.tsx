import { FC } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScreenRoutesEnum, StackParamList } from '../../types'
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSILoadingScreenActivityIndicatorContainerStyled as ActivityIndicatorContainer,
  SSILoadingScreenActivityCaptionStyled as ActivityCaption,
  SSILoadingScreenActivityIndicatorStyled as ActivityIndicator
} from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOADING>

const SSILoadingScreen: FC<Props> = (props: Props): JSX.Element => {
  const { message } = props.route.params

  return (
    <Container>
      <ActivityIndicatorContainer>
        <ActivityIndicator />
      </ActivityIndicatorContainer>
      <ActivityCaption>{message}</ActivityCaption>
    </Container>
  )
}

export default SSILoadingScreen
