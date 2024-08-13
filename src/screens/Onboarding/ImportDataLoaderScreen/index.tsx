import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {translate} from '../../../localization/Localization';
import {useContext, useEffect} from 'react';
import {
  Container,
  Text,
  ContentContainer,
  ButtonContainer,
  DataLoadingIndicator,
  DataLoadingScreenHeading,
  DataLoadingScreenSubHeading,
} from '../components/styles';
import {OnboardingContext} from 'src/navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from 'src/types/machines/onboarding';
import {Image} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';

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
      <ButtonContainer>
        <PrimaryButton
          style={{height: 42, width: 300}}
          caption="Continue"
          backgroundColors={['#7276F7', '#7C40E8']}
          captionColor={fontColors.light}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
        />
      </ButtonContainer>
    </Container>
  );
};

export default ImportDataLoaderScreen;
