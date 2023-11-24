import {PureComponent} from 'react';
import {BackHandler, NativeEventSubscription} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  SSILoadingScreenActivityCaptionStyled as ActivityCaption,
  SSILoadingScreenActivityIndicatorStyled as ActivityIndicator,
  SSILoadingScreenActivityIndicatorContainerStyled as ActivityIndicatorContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.LOADING>;

class SSILoadingScreen extends PureComponent<Props> {
  hardwareBackPressListener: NativeEventSubscription;

  componentDidMount = (): void => {
    // we add this listener to block the os back button from executing on the loading screen. returning true will not let the event bubble up.
    this.hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', (): boolean => true);
  };

  componentWillUnmount = (): void => {
    this.hardwareBackPressListener.remove();
  };

  render(): JSX.Element {
    const {message} = this.props.route.params;
    return (
      <Container>
        <ActivityIndicatorContainer>
          <ActivityIndicator />
        </ActivityIndicatorContainer>
        <ActivityCaption>{message}</ActivityCaption>
      </Container>
    );
  }
}

export default SSILoadingScreen;
