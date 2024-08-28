import {useContext, useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {Container, ContentContainer, DataLoadingIndicator, DataLoadingScreenHeading, DataLoadingScreenSubHeading} from '../components/styles';

const ImportDataLoaderScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, {easing: Easing.linear, duration: 1000}), -1, false);
  }, []);
  const animation = useAnimatedStyle(() => {
    return {
      marginBottom: 20,
      transform: [
        {
          rotate: rotation.value + 'deg',
        },
      ],
    };
  });
  return (
    <Container>
      <ContentContainer>
        <Animated.View style={animation}>
          <DataLoadingIndicator resizeMode="stretch" source={require('../../../assets/images/loader.png')} width={40} height={40} />
        </Animated.View>
        <DataLoadingScreenHeading>{translate('import_data_loader_step_title')}</DataLoadingScreenHeading>
        <DataLoadingScreenSubHeading>{translate('import_data_loader_step_subtitle')}</DataLoadingScreenSubHeading>
      </ContentContainer>
    </Container>
  );
};

export default ImportDataLoaderScreen;
