import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
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
      <PrimaryButton
        style={{height: 42, width: 300}}
        caption="Continue"
        backgroundColors={['#7276F7', '#7C40E8']}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </Container>
  );
};

export default ImportDataLoaderScreen;
