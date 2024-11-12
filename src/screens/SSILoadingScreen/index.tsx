import {FC, ReactElement, useCallback} from 'react';
import {BackHandler} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  SSILoadingScreenActivityCaptionStyled as ActivityCaption,
  SSILoadingScreenActivityIndicatorStyled as ActivityIndicator,
  SSILoadingScreenActivityIndicatorContainerStyled as ActivityIndicatorContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOADING>;

const SSILoadingScreen: FC<Props> = (props: Props): ReactElement => {
  const {message} = props.route.params;

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', (): boolean => true);
      return () => backHandler.remove();
    }, []),
  );

  return (
    <Container>
      <ActivityIndicatorContainer>
        <ActivityIndicator />
      </ActivityIndicatorContainer>
      <ActivityCaption>{message}</ActivityCaption>
    </Container>
  );
};

export default SSILoadingScreen;
