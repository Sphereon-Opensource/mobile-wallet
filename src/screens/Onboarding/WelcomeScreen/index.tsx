import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useState} from 'react';
import {LayoutChangeEvent, Platform, StatusBar, View} from 'react-native';
import Svg from 'react-native-svg';
import WelcomeBackground from '../../../assets/images/welcomeBackground.svg';
import {contentContainerStyle} from '../../../components/containers/ScreenContainer';
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
  const [svgDimensions, setSVGDimensions] = useState<null | {width: number; height: number}>(null);
  const isAndroid = Platform.OS === 'android';
  const handleSVGContainerLayout = (event: LayoutChangeEvent) => {
    event.target.measure((_, __, width, height) => {
      if (typeof width !== 'number' || typeof height !== 'number') {
        return;
      }
      const containerAspectRatio = width / height;
      if (containerAspectRatio < SVG_ASSET_ASPECT_RATIO) {
        setSVGDimensions({width: height * SVG_ASSET_ASPECT_RATIO, height});
      } else {
        setSVGDimensions({width, height: width / SVG_ASSET_ASPECT_RATIO});
      }
    });
  };

  return (
    <View style={{flex: 1, justifyContent: 'space-between', backgroundColor: backgroundColors.primaryDark, paddingBottom: 32}}>
      {isAndroid && <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />}
      <View style={{flex: 1, overflow: 'hidden'}} onLayout={handleSVGContainerLayout}>
        {svgDimensions && (
          <Svg width={svgDimensions.width} height={svgDimensions.height} viewBox={`0 0 ${SVG_ASSET_WIDTH} ${SVG_ASSET_HEIGHT}`}>
            <WelcomeBackground />
          </Svg>
        )}
      </View>
      <View style={[contentContainerStyle, {marginTop: 24}]}>
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
    </View>
  );
};

export default WelcomeScreen;
