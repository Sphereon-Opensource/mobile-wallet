import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {BackHandler, NativeEventSubscription} from 'react-native';
import {
  SSILoadingScreenActivityCaptionStyled as ActivityCaption,
  SSILoadingScreenActivityIndicatorStyled as ActivityIndicator,
  SSILoadingScreenActivityIndicatorContainerStyled as ActivityIndicatorContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
} from '../../styles/components';
import {ShareStackParamsList} from '../../types';

type Props = NativeStackScreenProps<ShareStackParamsList, 'QrLoading' | 'ShareLoading'>;

const LoadingScreen = ({
  route: {
    params: {message},
  },
}: Props) => {
  useEffect(() => {
    const hardwareBackPressListener: NativeEventSubscription = BackHandler.addEventListener('hardwareBackPress', (): boolean => true);
    return () => hardwareBackPressListener.remove();
  }, []);

  return (
    <Container>
      <ActivityIndicatorContainer>
        <ActivityIndicator />
      </ActivityIndicatorContainer>
      <ActivityCaption>{message}</ActivityCaption>
    </Container>
  );
};

export default LoadingScreen;
