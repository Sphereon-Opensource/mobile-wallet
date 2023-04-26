import { FC } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScreenRoutesEnum, StackParamList } from '../../types'
import {
  SSIBasicContainerStyled as Container
} from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOADING>

const SSILoadingScreen: FC<Props> = (props: Props): JSX.Element => {
  console.log('LOADING')
  return (
    <Container>
    </Container>
  )
}

export default SSILoadingScreen
