import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {View, useWindowDimensions} from 'react-native';
import Svg from 'react-native-svg';
import WelcomeBackground from '../../../assets/images/welcomeBackground.svg';
import ScreenContainer, {contentContainerStyle} from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

// Size of the assets/images/fitted.svg file
const SVG_ASSET_WIDTH = 375;
const SVG_ASSET_HEIGHT = 484;
const SVG_ASSET_ASPECT_RATIO = SVG_ASSET_WIDTH / SVG_ASSET_HEIGHT;

const WelcomeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const translationPath = 'onboarding_pages.welcome';
  const {width: screenWidth} = useWindowDimensions();
  return (
    <ScreenContainer headerAvailable={false} style={{paddingHorizontal: 0, paddingBottom: 0}}>
      <Svg width={screenWidth} height={screenWidth / SVG_ASSET_ASPECT_RATIO} viewBox={`0 0 ${SVG_ASSET_WIDTH} ${SVG_ASSET_HEIGHT}`}>
        <WelcomeBackground />
      </Svg>
      <View style={{...contentContainerStyle, paddingTop: 24}}>
        <ScreenTitleAndDescription
          title={translate(`${translationPath}.title`)}
          description={translate(`${translationPath}.description`)}
          titleVariant="h0"
          containerStyle={{gap: 16}}
        />
        <View style={{marginTop: 'auto'}}>
          <PrimaryButton
            style={{height: 42, width: '100%'}}
            caption={translate(`${translationPath}.button_caption`)}
            captionColor={fontColors.light}
            onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default WelcomeScreen;
